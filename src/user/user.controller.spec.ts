import { UserModule } from "./user.module";
import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { expect } from "chai";
import { ConfigModule } from "@nestjs/config";
import { UserService } from "./user.service";
import { repositoryMockFactory } from "./user.service.spec";
import { JwtService } from "@nestjs/jwt";
import { GreenIdService } from "src/services/GreenIdService";

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
                    useFactory: () => ({
                        sendEmailVerification: () => ({})
                    })
                },
                {
                    provide: "IUserService",
                    useClass: UserService
                },
                JwtService,
                {
                    provide: "IGreenIdService",
                    useClass: GreenIdService
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
