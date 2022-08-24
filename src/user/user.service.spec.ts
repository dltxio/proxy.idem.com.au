import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { expect } from "chai";
import { ConfigService } from "@nestjs/config";

const repositoryMockFactory = () => ({
    find: () => ({}),
    findOneBy: () => ({}),
    save: () => ({}),
    update: () => ({}),
    delete: () => ({})
});

describe("UserService", () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                ConfigService,
                {
                    provide: "USER_REPOSITORY",
                    useFactory: repositoryMockFactory
                },
                {
                    provide: "REQUEST_REPOSITORY",
                    useFactory: repositoryMockFactory
                },
                {
                    provide: "TESTER_REPOSITORY",
                    useFactory: repositoryMockFactory
                },
                {
                    provide: "ISmsService",
                    useFactory: () => ({})
                },
                {
                    provide: "IEmailService",
                    useFactory: () => ({
                        sendEmailVerification: () => ({})
                    })
                }
            ]
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(service).to.be.not.undefined;
    });
});
