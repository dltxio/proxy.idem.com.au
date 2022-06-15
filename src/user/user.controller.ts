import {
    Controller,
    Inject,
    Post,
    HttpStatus,
    Body,
    Get
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { User } from "../data/entities/user.entity";
import { IUserService, UserVerifyRequestBody } from "../interfaces";

@Controller("user")
export class UserController {
    constructor(@Inject("IUserService") private userService: IUserService) {}

    @Post("verify")
    @ApiOperation({ summary: "Verify user" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async verify(@Body() body: UserVerifyRequestBody): Promise<boolean> {
        await this.userService.create(body);
        //TODO: Implement TPA KYC verification
        return true;
    }

    @Get()
    @ApiOperation({ summary: "Get users" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async getAll(): Promise<User[]> {
        return this.userService.findAll();
    }
}
