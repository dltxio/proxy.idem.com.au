import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Inject,
    Ip,
    Param,
    Post
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import {
    AuthenticatedUser,
    IPartnerService,
    LoginRequest
} from "../interfaces";
import { Partner } from "src/data/entities/partner.entity";
import { Request } from "src/data/entities/request.entity";

@Controller("partners")
export class PartnerController {
    constructor(
        @Inject("IPartnerService")
        private partnerService: IPartnerService
    ) {}

    @Get("requests")
    @ApiOperation({ summary: "Get verification requests" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async requestsForPartner(): Promise<Request[]> {
        return await this.partnerService.requests();
    }

    @Get(":id")
    @ApiOperation({ summary: "Get Partner by ID" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async getById(@Param("id") id: number): Promise<Partner> {
        return await this.partnerService.getById(id);
    }

    // TODO MOVE TO INVOICE CONTROLLER
    @Get("/invoices:id")
    @ApiOperation({ summary: "Get Partner Invoices" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async getPartnerInvoices(@Param("id") id: number): Promise<Partner> {
        return await this.partnerService.getById(id);
    }

    @Post("authenticate")
    @ApiOperation({ summary: "Authenticate Partner" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async authenticate(@Body() body: LoginRequest): Promise<AuthenticatedUser> {
        {
            return { id: "4", email: body.email, role: "admin", token: "" };
        }
    }
}
