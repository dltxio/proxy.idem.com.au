import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExampleService } from "./services/Example.service";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        UserModule,
        AuthModule
    ],
    providers: [ExampleService]
})
export class AppModule {}
