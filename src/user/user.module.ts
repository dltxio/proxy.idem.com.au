import { Module } from "@nestjs/common";
import { DatabaseModule } from "../data/database.module";
import { UserController } from "./user.controller";
import { userProviders } from "./user.providers";
import { UserService } from "./user.service";
import { EmailService } from "../services/EmailService";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GreenIdService } from "../services/GreenIdService";
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
            provide: "IEmailService",
            useClass: EmailService
        },
        {
            provide: "IXeroService",
            useClass: XeroService
        },
        {
            provide: "IGreenIdService",
            useClass: GreenIdService
        }
    ]
})
export class UserModule {}
