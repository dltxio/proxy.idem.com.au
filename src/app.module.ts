import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExampleService } from "./services/Example.service";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health/health.controller";
import { HealthModule } from "./health/health.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        UserModule,
        AuthModule,
        HealthModule
    ],
    providers: [ExampleService],
    controllers: [HealthController]
})
export class AppModule {}
