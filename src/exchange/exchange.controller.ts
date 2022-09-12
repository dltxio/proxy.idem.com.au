import { Body, Controller, HttpStatus, Inject, Ip, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SignupResponse } from "../types/general";
import {
    ExchangeSignupCallBack,
    IExchangeService,
    IThirdPartyService,
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
}
