import { Module } from "@nestjs/common";
import { ExampleService } from "../services/Example.service";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";

@Module({
    controllers: [AccountsController],
    providers: [
        {
            provide: "IAccountsService",
            useClass: AccountsService
        },
        {
            provide: "IExampleService",
            useClass: ExampleService
        }
    ]
})
export class AccountsModule {}
