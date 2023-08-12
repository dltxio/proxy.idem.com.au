import { Inject, Injectable, Logger } from "@nestjs/common";
import { User } from "../data/entities/user.entity";
import { Request } from "../data/entities/request.entity";
import { ExchangeSignupCallBack, IExchangeService } from "../interfaces";
import { Repository } from "typeorm";
import Expo from "expo-server-sdk";
import { ConfigService } from "@nestjs/config";
import { ConfigSettings, RequestType } from "../types/general";

@Injectable()
export class ExchangeService implements IExchangeService {
    private readonly logger = new Logger("ExchangeService");
    private expo: Expo;

    constructor(
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>,
        @Inject("REQUEST_REPOSITORY")
        private requestRepository: Repository<Request>,
        private readonly config: ConfigService
    ) {
        this.expo = new Expo({
            accessToken: this.config.get(ConfigSettings.EXPO_ACCESS_TOKEN)
        });
    }

    public async requests(): Promise<Request[]> {
        return await this.requestRepository.find();
    }

    public async pushSignupNotification(
        signupRequest: ExchangeSignupCallBack,
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
}
