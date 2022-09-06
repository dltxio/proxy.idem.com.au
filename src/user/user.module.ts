import { ThirdPartyService } from "./../services/ThirdPartyService";
import { Module } from "@nestjs/common";
import { KycService } from "../services/KycService";
import { DatabaseModule } from "../data/database.module";
import { UserController } from "./user.controller";
import { userProviders } from "./user.providers";
import { UserService } from "./user.service";
import { SmsService } from "../services/SmsService";
import { EmailService } from "../services/EmailService";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { XeroService } from "../services/XeroService";

@Module({
    imports: [
        DatabaseModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get("JWT_SECRET"),
                signOptions: {
                    expiresIn: `${configService.get("JWT_EXPIRATION_SECONDS")}s`
                }
            })
        })
    ],

    controllers: [UserController],
    providers: [
        ...userProviders,
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
        },
        {
            provide: "IXeroService",
            useClass: XeroService
        }
    ]
})
export class UserModule {}
