import { OtpController } from "./otp.controller";
import { Module } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { SmsService } from "../services/SmsService";

@Module({
    controllers: [OtpController],
    providers: [
        {
            provide: "IOtpService",
            useClass: OtpService
        },
        {
            provide: "ISmsService",
            useClass: SmsService
        }
    ]
})
export class OtpModule {}
