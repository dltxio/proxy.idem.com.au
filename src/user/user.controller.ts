import { Controller, Inject, Post, HttpStatus, Body } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { IUserService, UserVerifyRequestBody } from "../interfaces";

@Controller("user")
export class UserController {
    constructor(@Inject("IUserService") private userService: IUserService) {}

    @Post("verify")
    @ApiOperation({ summary: "Verify user" })
    @ApiResponse({
        status: HttpStatus.OK
        //type: //TODO: Add type
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async verify(@Body() body: UserVerifyRequestBody): Promise<boolean> {
        //TODO: Implement TPA KYC verification
        return true;
    }
}
