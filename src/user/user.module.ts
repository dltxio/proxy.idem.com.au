import { Module } from "@nestjs/common";
import { DatabaseModule } from "../data/database.module";
import { UserController } from "./user.controller";
import { userProviders } from "./user.providers";
import { UserService } from "./user.service";
import { MailJetService } from "../services/MailJetService";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GreenIdService } from "../services/GreenIdService";
import { PartnerService } from "src/partner/partner.service";

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
            provide: "IEmailService",
            useClass: MailJetService
        },
        {
            provide: "IKYCService",
            useClass: GreenIdService
        },
        {
            provide: "IPartnerService",
            useClass: PartnerService
        }
    ]
})
export class UserModule {}
