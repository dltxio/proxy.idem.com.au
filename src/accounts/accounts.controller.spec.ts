import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ExampleService } from "../services/Example.service";
import { AccountsController } from "./accounts.controller";
import { AccountsModule } from "./accounts.module";
import { AccountsService } from "./accounts.service";
import { expect } from "chai";

describe("AccountsController", () => {
    let controller: AccountsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AccountsController],
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true
                }),
                AccountsModule
            ],
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
        }).compile();

        controller = module.get<AccountsController>(AccountsController);
    });

    it("should be defined", () => {
        expect(controller).to.be.not.undefined;
    });
});
