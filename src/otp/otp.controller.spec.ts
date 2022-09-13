import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { expect } from "chai";
import { repositoryMockFactory } from "../user/user.service.spec";
import { KycService } from "../services/KycService";
import { UserService } from "../user/user.service";
import { OtpController } from "./otp.controller";
import { EmailService } from "../services/EmailService";
import { JwtService } from "@nestjs/jwt";
import { OtpService } from "./otp.service";

describe("OtpController", () => {
    let controller: OtpController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OtpController],
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true
                })
            ],
            providers: [
                {
                    provide: "IOtpService",
                    useClass: OtpService
                },
                {
                    provide: "ISmsService",
                    useFactory: () => ({})
                },
                {
                    provide: "USER_REPOSITORY",
                    useFactory: repositoryMockFactory
                },
                {
                    provide: "IEmailService",
                    useClass: EmailService
                },
                {
                    provide: "IUserService",
                    useClass: UserService
                },
                JwtService,
                {
                    provide: "IKycService",
                    useClass: KycService
                }
            ]
        }).compile();

        controller = module.get<OtpController>(OtpController);
    });

    it("should be defined", () => {
        expect(controller).to.not.be.undefined;
    });
});
