import { VerifyController } from "./verify.controller";
import { Module } from "@nestjs/common";
import { VerifyService } from "./verify.service";
import { SmsService } from "../services/SmsService";

@Module({
    controllers: [VerifyController],
    providers: [
        {
            provide: "VerifyService",
            useClass: VerifyService
        },
        {
            provide: "ISmsService",
            useClass: SmsService
        }
    ]
})
export class OtpModule {}
