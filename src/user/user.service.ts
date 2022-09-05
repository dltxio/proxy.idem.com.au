import { hashMessage } from "ethers/lib/utils";
import {
    IEmailService,
    UserDto,
    PgpPublicKeyDto,
    ConfigSettings,
    UsersResponse
} from "./../interfaces";
import {
    Injectable,
    Inject,
    Logger,
    BadRequestException
} from "@nestjs/common";
import * as openpgp from "openpgp";
import { User } from "../data/entities/user.entity";
import { Repository } from "typeorm";
import Expo from "expo-server-sdk";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
    private expo: Expo;
    private readonly logger = new Logger("UserService");
    constructor(
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>,
        @Inject("IEmailService") private emailService: IEmailService,
        private readonly config: ConfigService,
        private readonly jwtService: JwtService
    ) {
        this.expo = new Expo({
            accessToken: this.config.get(ConfigSettings.EXPO_ACCESS_TOKEN)
        });
    }

    public async findOne(
        hashEmail: string
    ): Promise<UsersResponse | undefined> {
        const user = await this.userRepository.findOneBy({
            email: hashEmail
        });

        if (!user) return undefined;

        return {
            userId: user.userId,
            email: user.email,
            createdAt: user.createdAt,
            emailVerified: user.emailVerified
        };
    }
    public async findAll(): Promise<UsersResponse[]> {
        const usersResponse = [];
        const users = await this.userRepository.find();

        for (const user of users) {
            usersResponse.push({
                userId: user.userId,
                email: user.email,
                createdAt: user.createdAt,
                emailVerified: user.emailVerified
            });
        }

        return usersResponse;
    }

    public async create(newUser: UserDto): Promise<User> {
        const user = await this.userRepository.findOneBy({
            email: newUser.email.toLowerCase()
        });
        if (!user) {
            this.logger.verbose(`New user ${newUser.email} created`);
            return this.userRepository.save(newUser);
        }
        return user;
    }

    public async update(userId: string, request: UserDto): Promise<User> {
        const user = await this.userRepository.findOneBy({ userId: userId });
        if (!user) {
            this.logger.verbose(`User ${userId} not found`);
            throw new Error("User not found");
        }

        if (request.expoToken && request.expoToken != user.expoPushToken) {
            user.expoPushToken = request.expoToken;
        }

        if (request.pgpPublicKey && request.pgpPublicKey != user.publicKey) {
            user.publicKey = request.pgpPublicKey;
        }

        return this.userRepository.save(user);
    }

    public async pushNotifications(message: string): Promise<void> {
        //TODO: Implement push notification
        const messages = [];

        const users = await this.userRepository.find();

        for (const user of users) {
            if (user.expoPushToken) {
                //Validate Expo push token
                if (!Expo.isExpoPushToken(user.expoPushToken)) {
                    this.logger.verbose(
                        `User ${user.userId} has invalid Expo push token`
                    );
                    continue;
                }
                // Construct a message
                messages.push({
                    to: user.expoPushToken,
                    sound: "default",
                    body: message,
                    data: { withSome: "Idem notification" }
                });
            }
        }

        const chunks = this.expo.chunkPushNotifications(messages);
        const tickets = [];
        for (const chunk of chunks) {
            try {
                const ticketChunk = await this.expo.sendPushNotificationsAsync(
                    chunk
                );
                this.logger.verbose(ticketChunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                this.logger.error(error.message);
            }
        }

        const receiptIds = [];

        for (const ticket of tickets) {
            if (ticket.id) {
                receiptIds.push(ticket.id);
            }
        }

        const receiptIdChunks =
            this.expo.chunkPushNotificationReceiptIds(receiptIds);

        for (const chunk of receiptIdChunks) {
            try {
                const receipts =
                    await this.expo.getPushNotificationReceiptsAsync(chunk);

                for (const receiptId in receipts) {
                    const { status, details } = receipts[receiptId];
                    if (status === "ok") continue;

                    if (status === "error") {
                        this.logger.error(
                            `There was an error sending a notification`
                        );
                        if (details && details.error) {
                            this.logger.error(
                                `The error code is: ${details.error}`
                            );
                        }
                    }
                }
            } catch (error) {
                this.logger.error(error.message);
            }
        }
    }

    public async putPgpPublicKey(body: PgpPublicKeyDto): Promise<boolean> {
        try {
            const publicKey = await openpgp.readKey({
                armoredKey: body.publicKeyArmored
            });
            let user: User;

            const emailFromPublicKey = publicKey.users[0].userID.email;
            if (hashMessage(emailFromPublicKey) != body.hashEmail)
                throw new Error("Email does not match");

            const payload = { email: emailFromPublicKey };
            const token = this.jwtService.sign(payload);
            user = await this.userRepository.findOneBy({
                email: body.hashEmail
            });
            if (user) {
                //Update the public key if user found.
                user.publicKey = body.publicKeyArmored;
                user.emailVerificationCode = token;
                await this.userRepository.save(user);
            } else {
                //Create new user if no user found.
                user = await this.userRepository.save({
                    email: body.hashEmail,
                    publicKey: body.publicKeyArmored,
                    emailVerificationCode: token
                });
            }

            this.logger.log(`User: ${user.userId} public key added`);
            //Email service to send verification email
            await this.emailService.sendEmailVerification(
                publicKey.users[0].userID.email.trim().toLowerCase(),
                token
            );
            return true;
        } catch (error) {
            this.logger.error(error);
            return false;
        }
    }

    public async verifyEmail(token: string): Promise<boolean> {
        const email = await this.decodeEmailFromToken(token);
        const formattedEmail = email.trim().toLowerCase();
        try {
            const user = await this.userRepository.findOneBy({
                email: hashMessage(formattedEmail)
            });

            if (!user) throw new Error("Email not found");

            if (user.emailVerificationCode != token)
                throw new Error(
                    "Verification code is wrong, please try resend email"
                );

            user.emailVerified = true;
            await this.userRepository.save(user);
            this.logger.verbose(`${formattedEmail} email address verified`);
            return true;
        } catch (error) {
            this.logger.error(error);
            return false;
        }
    }

    private async decodeEmailFromToken(token: string): Promise<string> {
        try {
            const payload = this.jwtService.verify(token);
            if (typeof payload === "object" && "email" in payload) {
                return payload.email;
            }
            throw new BadRequestException();
        } catch (error) {
            if (error?.name === "TokenExpiredError") {
                throw new BadRequestException(
                    "Email confirmation token expired"
                );
            }
            throw new BadRequestException("Bad confirmation token");
        }
    }
}
