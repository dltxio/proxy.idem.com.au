import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExampleService } from "./services/Example.service";
import { UserModule } from "./user/user.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        UserModule
    ],
    providers: [ExampleService]
})
export class AppModule {}
