import { hashMessage } from "ethers/lib/utils";
import {
    IEmailService,
    ISmsService,
    NewUser,
    PublicKeyDto,
    RequestOtpRequest,
    RequestOtpResponse,
    TestFlightRequest,
    VerifyOtpRequest
} from "./../interfaces";
import {
    Injectable,
    Inject,
    Logger,
    BadRequestException
} from "@nestjs/common";
import * as openpgp from "openpgp";

import { User } from "../data/entities/user.entity";
import { Request } from "../data/entities/request.entity";
import { Repository } from "typeorm";
import {
    ConfigSettings,
    RequestType,
    SignupNotificationRequest,
    UserExpoPushTokenRequestBody,
    UsersResponse
} from "../interfaces";
import Expo from "expo-server-sdk";
import { ConfigService } from "@nestjs/config";
import { Tester } from "../data/entities/tester.entity";
import crypto from "crypto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
    private expo: Expo;
    private readonly logger = new Logger("UserService");
    constructor(
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>,
        @Inject("REQUEST_REPOSITORY")
        private requestRepository: Repository<Request>,
        @Inject("TESTER_REPOSITORY")
        private testerRepository: Repository<Tester>,
        @Inject("ISmsService") private smsService: ISmsService,
        @Inject("IEmailService") private emailService: IEmailService,
        private readonly config: ConfigService,
        private readonly jwtService: JwtService
    ) {
        this.expo = new Expo({
            accessToken: this.config.get(ConfigSettings.EXPO_ACCESS_TOKEN)
        });
    }

    public async findOne(email: string): Promise<UsersResponse | undefined> {
        const user = await this.userRepository.findOneBy({
            email: hashMessage(email)
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

    public async create(newUser: NewUser): Promise<User> {
        const user = await this.userRepository.findOneBy({
            email: newUser.email.toLowerCase()
        });
        if (!user) {
            this.logger.verbose(`New user ${newUser.email} created`);
            return this.userRepository.save(newUser);
        }
        return user;
    }

    public async requestToBeTester(
        testFlightRequest: TestFlightRequest
    ): Promise<Tester> {
        const requestTest = await this.testerRepository.findOneBy({
            email: testFlightRequest.email.toLowerCase()
        });
        if (requestTest) return requestTest;

        const result = await this.testerRepository.save(testFlightRequest);
        this.logger.verbose(`New tester ${testFlightRequest.email} created`);
        return result;
    }

    public async putToken(
        userId: string,
        token: UserExpoPushTokenRequestBody
    ): Promise<User> {
        const user = await this.userRepository.findOneBy({ userId: userId });
        if (!user) {
            this.logger.verbose(`User ${userId} not found`);
            throw new Error("User not found");
        }
        if (!user.expoPushToken || user.expoPushToken != token.token) {
            user.expoPushToken = token.token;
            return this.userRepository.save(user);
        }

        return user;
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

    public async pushSignupNotification(
        signupRequest: SignupNotificationRequest,
        ip: string
    ): Promise<void> {
        const user = await this.userRepository.findOneBy({
            email: signupRequest.email.toLowerCase()
        });

        //Check to see if user exist
        if (!user) {
            this.logger.verbose(`User: ${signupRequest.email} not found`);
            throw new Error(`User: ${signupRequest.email} not found`);
        }

        if (!user.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) {
            this.logger.verbose(
                `User: ${signupRequest.email} notification token not found or invalided token`
            );
            throw new Error("Notification token not found or invalided token");
        }

        //Save the signup request
        await this.requestRepository.save({
            from: signupRequest.source,
            to: "IDEM",
            ipAddress: ip,
            requestType: RequestType.Signup
        });

        const messages = [];
        const url = `${this.config.get(ConfigSettings.APP_DEEPLINK_URL)}?id=${
            signupRequest.source
        }`;

        messages.push({
            to: user.expoPushToken,
            sound: "default",
            body: signupRequest.message,
            data: { url: url }
        });

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
    }

    public async requestOtp(
        body: RequestOtpRequest
    ): Promise<RequestOtpResponse> {
        const { mobileNumber } = body;
        const otp = Math.floor(Math.random() * 900000) + 100000;
        const expiryTimestamp =
            new Date().getTime() +
            parseInt(this.config.get(ConfigSettings.OTP_EXPIRY_TIME, "60000"));
        const salt = this.config.get(
            ConfigSettings.OTP_HASHING_SALT,
            "Hi i'm default salt from idem proxy :)"
        );
        const messageForHash = mobileNumber + otp + expiryTimestamp + salt;
        const hash = crypto
            .createHmac(
                "sha256",
                this.config.get(ConfigSettings.OTP_HASHING_SECRET)
            )
            .update(messageForHash)
            .digest("hex");

        const message = `Your OTP code for IDEM is ${otp}`;
        await this.smsService.send(mobileNumber, message);

        return {
            hash,
            expiryTimestamp
        };
    }

    public async verifyOtp(body: VerifyOtpRequest): Promise<boolean> {
        const { mobileNumber, code, hash, expiryTimestamp } = body;
        const currentTimestamp = new Date().getTime();
        if (currentTimestamp > expiryTimestamp) throw new Error("Code expired");
        const salt = this.config.get(
            ConfigSettings.OTP_HASHING_SALT,
            "Hi i'm default salt from idem proxy :)"
        );
        const hashedMessage = crypto
            .createHmac(
                "sha256",
                this.config.get(ConfigSettings.OTP_HASHING_SECRET)
            )
            .update(mobileNumber + code + expiryTimestamp + salt)
            .digest("hex");

        return hashedMessage === hash;
    }

    public async addPublicKey(body: PublicKeyDto): Promise<boolean> {
        try {
            const publicKey = await openpgp.readKey({
                armoredKey: body.publicKeyArmored
            });
            let user: User;

            const emailFromPublicKey = publicKey.users[0].userID.email;

            if (hashMessage(emailFromPublicKey) != body.email)
                throw new Error("Email not match");

            const payload = { email: emailFromPublicKey };
            const token = this.jwtService.sign(payload);
            user = await this.userRepository.findOneBy({ email: body.email });
            if (user) {
                //Update the public key if user found.
                user.publicKey = body.publicKeyArmored;
                user.emailVerificationCode = token;
                await this.userRepository.save(user);
            } else {
                //Create new user if no user found.
                user = await this.userRepository.save({
                    email: body.email,
                    emailFromPublicKey: token
                });
            }

            this.logger.log(`User: ${user.userId} public key added`);
            //Email service to send verification email
            await this.emailService.sendEmailVerification(
                publicKey.users[0].userID.email,
                token
            );
            return true;
        } catch (error) {
            this.logger.error(error);
            return false;
        }
    }

    public async verifyEmail(email: string, token: string): Promise<boolean> {
        try {
            const user = await this.userRepository.findOneBy({
                email: hashMessage(email)
            });

            if (!user) throw new Error("Email not found");

            if (user.emailVerificationCode != token)
                throw new Error(
                    "Verification code is wrong, please try resend email"
                );

            user.emailVerified = true;
            await this.userRepository.save(user);
            return true;
        } catch (error) {
            this.logger.error(error);
            return false;
        }
    }

    public async decodeEmailFromToken(token: string): Promise<string> {
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
