import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { expect } from "chai";
import { OtpController } from "./otp.controller";
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
                }
            ]
        }).compile();

        controller = module.get<OtpController>(OtpController);
    });

    it("should be defined", () => {
        expect(controller).to.not.be.undefined;
    });
});
