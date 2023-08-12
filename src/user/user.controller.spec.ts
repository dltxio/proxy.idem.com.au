import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { expect } from "chai";
import { repositoryMockFactory } from "./user.service.spec";
import { JwtService } from "@nestjs/jwt";

// TODO: need to fix the unit test later
describe("UserController", () => {
    let controller: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: "USER_REPOSITORY",
                    useFactory: repositoryMockFactory
                },
                {
                    provide: "IEmailService",
                    useFactory: () => ({})
                },
                {
                    provide: "IUserService",
                    useFactory: () => ({})
                },
                JwtService,
                {
                    provide: "IKYCService",
                    useFactory: () => ({})
                },
                {
                    provide: "IAccountingService",
                    useFactory: () => ({})
                }
            ]
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    it("should be defined", () => {
        expect(controller).to.be.not.undefined;
    });
});
