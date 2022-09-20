import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Inject,
    Post
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RequestOtpResponse } from "../types/general";
import { RequestOtp, VerifyOtp, IOtpService } from "../interfaces";

@Controller("otp")
export class OtpController {
    constructor(@Inject("IOtpService") private otpService: IOtpService) {}

    @Post("request")
    @ApiOperation({
        summary:
            "User request otp to be sent via SMS to verify their phone number"
    })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async requestOtp(@Body() body: RequestOtp): Promise<RequestOtpResponse> {
        return this.otpService.requestOtp(body);
    }

    @Post("verify")
    @ApiOperation({
        summary:
            "User verify otp to be sent via SMS to verify their phone number"
    })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async verifyOtp(@Body() body: VerifyOtp): Promise<boolean> {
        return this.otpService.verifyOtp(body);
    }
}
