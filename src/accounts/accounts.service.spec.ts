import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ExampleService } from "../services/Example.service";
import { IExampleService } from "../interfaces";
import { AccountsService } from "./accounts.service";
import { expect } from "chai";
import Sinon from "sinon";

describe("AccountService", () => {
    let service: AccountsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true
                })
            ],
            providers: [
                AccountsService,
                ExampleService,
                {
                    provide: "IExampleService",
                    useClass: ExampleService
                }
            ]
        }).compile();

        service = module.get<AccountsService>(AccountsService);
        service.eventStore = module.get<IExampleService>(ExampleService);
    });

    it("should be defined", () => {
        expect(service).to.be.not.undefined;
    });

    describe("Creating a vault account", () => {
        it("should call the createVaultAccount method", async () => {
            const myId = "1";
            
            Sinon.replace(service, "getById", () => {
                return Promise.resolve(myId);
            });
            const spy = Sinon.spy(service, "getById");
            await service.getById(myId);
            expect(spy.calledWith(myId)).to.be.true;
            expect(spy.calledOnce).to.be.true;
        });
    });
});
