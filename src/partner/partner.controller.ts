import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Inject,
    Ip,
    Post
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
// import { SignupResponse } from "../types/general";
import { IPartnerService } from "../interfaces";
import { Partner } from "src/data/entities/partner.entity";

@Controller("partners")
export class PartnerController {
    constructor(
        @Inject("IPartnerService")
        private partnerService: IPartnerService
    ) {}
    @Get("requests")
    @ApiOperation({ summary: "Get verify requests" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async requests(): Promise<Request[]> {
        // return await this.exchangeService.requests();
        throw new Error("Not implemented");
    }

    @Get()
    @ApiOperation({ summary: "Get Partners" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async get(): Promise<Partner[]> {
        return await this.partnerService.get();
    }
}
