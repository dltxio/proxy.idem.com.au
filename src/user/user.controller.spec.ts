import { UserModule } from "./user.module";
import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { expect } from "chai";
import { ConfigModule } from "@nestjs/config";
import { UserService } from "./user.service";

//TODO: need to fix the unit test later
xdescribe("UserController", () => {
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
                    provide: "IUserService",
                    useClass: UserService
                }
            ]
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    it("should be defined", () => {
        expect(controller).to.be.not.undefined;
    });
});
