import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { OtpModule } from "./otp/otp.module";
import { ExchangeModule } from "./exchange/exchange.module";
import { PartnerModule } from "./partner/partner.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        UserModule,
        AuthModule,
        HealthModule,
        OtpModule,
        ExchangeModule,
        PartnerModule
    ]
})
export class AppModule {}
