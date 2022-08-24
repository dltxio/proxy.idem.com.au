import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { expect } from "chai";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../data/entities/user.entity";
import { Tester } from "../data/entities/tester.entity";
import { Request } from "../data/entities/request.entity";

const repositoryMockFactory = () => ({
    findOne: entity => entity,
    save: entity => entity,
    update: entity => entity,
    delete: entity => entity
});

describe("UserService", () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                ConfigService,
                JwtService,
                {
                    provide: getRepositoryToken(User),
                    useFactory: repositoryMockFactory
                },
                {
                    provide: getRepositoryToken(Request),
                    useFactory: repositoryMockFactory
                },
                {
                    provide: getRepositoryToken(Tester),
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

    it("should sent email with token", async () => {
        //spyOn(sendEmailVerification);
        await service.addPublicKey({
            publicKeyArmored: "test",
            email: "email@test.com"
        });
        expect(false).to.be.true;
    });

    it("should veriy token", async () => {
        const email = "email@test.com";
        const token = "123"; // generate token from email
        const result = await service.decodeEmailFromToken(token);
        expect(result).to.equal(email);
    });
});
