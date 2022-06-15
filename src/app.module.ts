import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExampleService } from "./services/Example.service";
import { AccountsModule } from "./accounts/accounts.module";
import { UserModule } from "./user/user.module";

@Module({
    imports: [
        AccountsModule,
        ConfigModule.forRoot({
            isGlobal: true
        }),
        UserModule
    ],
    providers: [ExampleService]
})
export class AppModule {}
