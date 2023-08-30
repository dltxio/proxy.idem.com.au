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
import { SignupResponse } from "../types/general";
import {
    ExchangeSignupCallBack,
    IExchangeService,
    IPartnerService,
    UserSignupRequest
} from "../interfaces";
import { Request } from "../data/entities/request.entity";

@Controller("exchanges")
export class ExchangeController {
    constructor(
        @Inject("IPartnerService")
        private thirdPartyService: IPartnerService,
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

    @Get("signups/:to")
    @ApiOperation({ summary: "Get signups" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async signups(): Promise<Request[]> {
        const to = "GPIB";
        return await this.exchangeService.signups(to);
    }
}
