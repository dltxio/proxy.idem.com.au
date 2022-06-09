import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExampleService } from "./services/Example.service";
import { AccountsModule } from "./accounts/accounts.module";

@Module({
    imports: [
        AccountsModule,
        ConfigModule.forRoot({
            isGlobal: true
        })
    ],
    providers: [ExampleService]
})
export class AppModule {}
