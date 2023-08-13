import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { expect } from "chai";
import { PartnerService } from "./partner.service";

describe("PartnerService", () => {
    let service: PartnerService;

    beforeEach(async () => {});

    it("should be defined", () => {
        expect(service).to.not.undefined;
    });
});
