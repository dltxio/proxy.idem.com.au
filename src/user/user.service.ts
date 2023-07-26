import { hashMessage } from "ethers/lib/utils";
import {
    IEmailService,
    UserDto,
    VerifyEmailRequestBody
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
import { ConfigSettings, UsersResponse } from "../types/general";

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

    public async create(newUser: UserDto): Promise<void> {
        let user: User;
        const hashedEmail = hashMessage(newUser.email);
        try {
            if (newUser.pgpPublicKey.startsWith("https://")) {
                const response = await fetch(newUser.pgpPublicKey);

                if (!response.ok) {
                    throw new Error("PGP public key not found");
                }

                newUser.pgpPublicKey = await response.text();
            }

            const publicKey = await openpgp.readKey({
                armoredKey: newUser.pgpPublicKey
            });

            const emailFromPublicKey = publicKey.users[0].userID.email;
            // Should not create user if email from token is different from email from public key
            if (hashMessage(emailFromPublicKey) != newUser.email)
                throw new Error("Email does not match");

            user = await this.userRepository.findOneBy({
                email: hashedEmail
            });

            // Do nothing if user already exists and email is verified
            if (user && user.emailVerified) return;

            const sixDigitCode = Math.floor(
                100000 + Math.random() * 900000
            ).toString();

            if (user && !user.emailVerified) {
                user.emailVerificationCode = sixDigitCode;
            } else {
                user = new User();
                user.email = hashedEmail;
                user.emailVerificationCode = sixDigitCode;
                this.logger.verbose(`New user ${newUser.email} created`);
            }
            await this.userRepository.save(user);
            await this.emailService.sendEmailVerification(
                newUser.email.trim().toLowerCase(),
                sixDigitCode
            );
        } catch (error) {
            this.logger.error(error.message);
            throw new Error(error.message);
        }
    }

    public async update(email: string, request: UserDto): Promise<User> {
        const user = await this.userRepository.findOneBy({ email: email });
        if (!user) {
            this.logger.verbose(`User ${email} not found`);
            throw new Error("User not found");
        }

        if (request.expoToken && request.expoToken != user.expoPushToken) {
            user.expoPushToken = request.expoToken;
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

    public async verifyEmail(body: VerifyEmailRequestBody): Promise<boolean> {
        const email = body.email;
        const formattedEmail = email.trim().toLowerCase();
        try {
            const user = await this.userRepository.findOneBy({
                email: hashMessage(formattedEmail)
            });

            if (!user) throw new Error("Email not found");

            if (user.emailVerificationCode != body.verificationCode)
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

    public async resendEmailVerification(
        hashedEmail: string
    ): Promise<boolean> {
        try {
            const user = await this.userRepository.findOneBy({
                email: hashedEmail
            });
            if (!user || !user.publicKey)
                throw new Error("Email or PGP key not found");

            const publicKey = await openpgp.readKey({
                armoredKey: user.publicKey
            });

            const emailFromPublicKey = publicKey.users[0].userID.email;

            if (hashMessage(emailFromPublicKey) != hashedEmail)
                throw new Error("Email does not match pgp key");

            const token =
                this._generateEmailVerificationToken(emailFromPublicKey);
            user.emailVerificationCode = token;
            await this.userRepository.save(user);
            await this.emailService.sendEmailVerification(
                emailFromPublicKey,
                token
            );
            return true;
        } catch (error) {
            this.logger.error(error);
            throw new Error(error);
        }
    }

    private _generateEmailVerificationToken(
        emailFromPublicKey: string
    ): string {
        const payload = { email: emailFromPublicKey };
        return this.jwtService.sign(payload);
    }
}
