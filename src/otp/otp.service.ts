import { Inject, Injectable, Logger } from "@nestjs/common";
import { IOtpService, ISmsService, VerifyOtp } from "./../interfaces";
import crypto from "crypto";
import { ConfigService } from "@nestjs/config";
import { ConfigSettings, RequestOtpResponse } from "../types/general";

@Injectable()
export class OtpService implements IOtpService {
    private readonly logger = new Logger("OtpService");
    constructor(
        private readonly config: ConfigService,
        @Inject("ISmsService") private smsService: ISmsService
    ) {}

    public async requestOtp(mobile: string): Promise<RequestOtpResponse> {
        const otp = Math.floor(Math.random() * 900000) + 100000;
        const expiryTimestamp =
            new Date().getTime() +
            parseInt(this.config.get(ConfigSettings.OTP_EXPIRY_TIME, "60000"));

        const salt = this.config.get(
            ConfigSettings.OTP_HASHING_SALT,
            "Hi i'm default salt from idem proxy :)"
        );

        const messageForHash = mobile + otp + expiryTimestamp + salt;
        const hash = crypto
            .createHmac(
                "sha256",
                this.config.get(ConfigSettings.OTP_HASHING_SECRET)
            )
            .update(messageForHash)
            .digest("hex");

        const message = `Your verfication code for IDEM is ${otp}`;
        await this.smsService.send(mobile, message);

        return {
            hash,
            expiryTimestamp
        };
    }

    public async verifyOtp(body: VerifyOtp): Promise<boolean> {
        const { mobileNumber, code, hash, expiryTimestamp } = body;
        // const currentTimestamp = new Date().getTime();
        // if (currentTimestamp > expiryTimestamp) throw new Error("Code expired");
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
}
