import { ThirdPartyService } from "./../services/ThirdPartyService";
import { Module } from "@nestjs/common";
import { KycService } from "../services/KycService";
import { DatabaseModule } from "../data/database.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { SmsService } from "../services/SmsService";
import { EmailService } from "../services/EmailService";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [
        DatabaseModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get("JWT_SECRET"),
                signOptions: {
                    expiresIn: `${configService.get("JWT_EXPIRATION_TIME")}s`
                }
            })
        })
    ],
    controllers: [UserController],
    providers: [
        {
            provide: "IUserService",
            useClass: UserService
        },
        {
            provide: "IThirdPartyService",
            useClass: ThirdPartyService
        },
        {
            provide: "IKycService",
            useClass: KycService
        },
        {
            provide: "ISmsService",
            useClass: SmsService
        },
        {
            provide: "IEmailService",
            useClass: EmailService
        }
    ]
})
export class UserModule {}
