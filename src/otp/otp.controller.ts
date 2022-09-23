import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Inject,
    Param,
    Post
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RequestOtpResponse } from "../types/general";
import { VerifyOtp, IOtpService } from "../interfaces";

@Controller("otp")
export class OtpController {
    constructor(@Inject("IOtpService") private otpService: IOtpService) {}

    @Get("request/:mobile")
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
    async requestOtp(
        @Param("mobile") mobile: string
    ): Promise<RequestOtpResponse> {
        return this.otpService.requestOtp(mobile);
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
