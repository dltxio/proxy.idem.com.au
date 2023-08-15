import {
    Body,
    Controller,
    HttpStatus,
    Get,
    Inject,
    Ip,
    Post
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SignupResponse } from "../types/general";
import {
    ExchangeSignupCallBack,
    IExchangeService,
    IThirdPartyService,
    InvoiceResponse,
    UserSignupRequest
} from "../interfaces";

@Controller("exchanges")
export class ExchangeController {
    constructor(
        @Inject("IThirdPartyService")
        private thirdPartyService: IThirdPartyService,
        @Inject("IExchangeService") private exchangeService: IExchangeService
    ) {}

    @Post("signup")
    @ApiOperation({ summary: "User signup" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async signup(
        @Ip() ip: string,
        @Body() body: UserSignupRequest
    ): Promise<SignupResponse> {
        return this.thirdPartyService.signUp(body, ip);
    }

    @Post("signup/callback")
    @ApiOperation({ summary: "Exchange signup call back notification" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async signupNotification(
        @Ip() ip: string,
        @Body() request: ExchangeSignupCallBack
    ): Promise<void> {
        return this.exchangeService.pushSignupNotification(request, ip);
    }

    @ApiOperation({
        summary: "Get invoices"
    })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    @Get("invoices")
    async getInvoices(): Promise<InvoiceResponse[]> {
        // return this.xeroService.sendInvoices(body);

        const response: InvoiceResponse[] = [];
        return response;

        // return {
        //     invoices: [
        //         {
        //             invoiceId: "1",
        //             invoiceNumber: "INV-001",
        //             invoiceDate: "2021-01-01",
        //             dueDate: "2021-01-01",
        //             amount: 100,
        //             currency: "AUD",
        //             status: "PAID"
        //         }
        //     }
    }
}
