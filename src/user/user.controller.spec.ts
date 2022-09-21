import { UserModule } from "./user.module";
import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { expect } from "chai";
import { ConfigModule } from "@nestjs/config";
import { UserService } from "./user.service";
import { repositoryMockFactory } from "./user.service.spec";
import { EmailService } from "../services/EmailService";
import { JwtService } from "@nestjs/jwt";
import { KycService } from "../services/KycService";

//TODO: need to fix the unit test later
describe("UserController", () => {
    let controller: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true
                }),
                UserModule
            ],
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
                    useClass: UserService
                },
                JwtService,
                {
                    provide: "IKycService",
                    useClass: KycService
                },
                {
                    provide: "IXeroService",
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
