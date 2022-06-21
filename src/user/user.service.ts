import { Injectable, Inject, Logger } from "@nestjs/common";
import { User } from "../data/entities/user.entity";
import { Repository } from "typeorm";
import {
    ConfigSettings,
    UserExpoPushTokenRequestBody,
    UserVerifyRequestBody
} from "../interfaces";
import Expo from "expo-server-sdk";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserService {
    private expo: Expo;
    private readonly logger = new Logger("UserService");
    constructor(
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>,
        private config: ConfigService
    ) {
        this.expo = new Expo({
            accessToken: this.config.get(ConfigSettings.EXPO_ACCESS_TOKEN)
        });
    }

    public async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    public async create(newUser: UserVerifyRequestBody): Promise<User> {
        const user = await this.userRepository.findOneBy({
            email: newUser.email
        });
        if (!user) {
            this.logger.verbose(`New user ${newUser.email} created`);
            return this.userRepository.save(newUser);
        }
        return user;
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
        user.expoPushToken = token.token;
        return this.userRepository.save(user);
    }

    public async pushNotification(message: string): Promise<void> {
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
                    data: { withSome: "test notification" }
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
                this.logger.error(error);
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
                this.logger.error(error);
            }
        }
    }
}
