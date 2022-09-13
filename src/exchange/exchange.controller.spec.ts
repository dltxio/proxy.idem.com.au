import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { expect } from "chai";
import { repositoryMockFactory } from "../user/user.service.spec";
import { ThirdPartyService } from "../services/ThirdPartyService";
import { ExchangeController } from "./exchange.controller";
import { ExchangeService } from "./exchange.service";

describe("ExchangeController", () => {
    let controller: ExchangeController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ExchangeController],
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true
                })
            ],
            providers: [
                {
                    provide: "USER_REPOSITORY",
                    useFactory: repositoryMockFactory
                },
                {
                    provide: "IThirdPartyService",
                    useClass: ThirdPartyService
                },
                {
                    provide: "IExchangeService",
                    useClass: ExchangeService
                },
                {
                    provide: "REQUEST_REPOSITORY",
                    useFactory: repositoryMockFactory
                }
            ]
        }).compile();

        controller = module.get<ExchangeController>(ExchangeController);
    });

    it("should be defined", () => {
        expect(controller).to.not.be.undefined;
    });
});
