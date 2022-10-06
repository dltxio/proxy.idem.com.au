import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { expect } from "chai";
import { repositoryMockFactory } from "../user/user.service.spec";
import { ExchangeService } from "./exchange.service";

describe("ExchangeService", () => {
    let service: ExchangeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExchangeService,
                ConfigService,
                {
                    provide: "USER_REPOSITORY",
                    useFactory: repositoryMockFactory
                },
                {
                    provide: "REQUEST_REPOSITORY",
                    useFactory: repositoryMockFactory
                }
            ]
        }).compile();

        service = module.get<ExchangeService>(ExchangeService);
    });

    it("should be defined", () => {
        expect(service).to.not.undefined;
    });
});
