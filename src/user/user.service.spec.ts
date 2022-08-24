import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { expect } from "chai";
import { userProviders } from "./user.providers";

//TODO: need to fix the unit test later
xdescribe("UserService", () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ...userProviders,
                {
                    provide: "IUserService",
                    useClass: UserService
                }
            ]
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(service).to.be.not.undefined;
    });
});
