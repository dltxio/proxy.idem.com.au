import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Inject,
    Ip,
    Param,
    Post,
    UseGuards
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import {
    AuthenticatedUser,
    IPartnerService,
    InvoiceDTO,
    LoginRequest
} from "../interfaces";
import { Partner } from "src/data/entities/partner.entity";
import { Request } from "src/data/entities/request.entity";
import * as crypto from "crypto";

@UseGuards()
@Controller("partners")
export class PartnerController {
    constructor(
        @Inject("IPartnerService")
        private partnerService: IPartnerService
    ) {}

    @Get("requests")
    @ApiOperation({ summary: "Get Verification Requests" })
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
    @Get("/invoices/:id")
    @ApiOperation({ summary: "Get Partner Invoices" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async getPartnerInvoices(@Param("id") id: number): Promise<InvoiceDTO> {
        const requests = await this.partnerService.requests();
        const total = requests.length * 6.0;
        return {
            number: "INV-1",
            issuedDate: new Date(),
            dueDate: new Date(),
            total: total,
            currency: "AUD",
            status: "Unpaid"
        };
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
        const partner = await this.partnerService.getByEmail(body.email);
        const passwordHash = crypto
            .createHash("sha256")
            .update(body.password)
            .digest("hex");
        if (!partner || partner.password !== passwordHash) {
            throw new Error("Invalid email or password");
        }

        return { id: "4", email: body.email, role: "admin", token: "" };
    }
}
