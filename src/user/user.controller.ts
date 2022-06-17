import {
    Controller,
    Inject,
    Post,
    HttpStatus,
    Body,
    Get,
    Param,
    Put
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { User } from "../data/entities/user.entity";
import {
    IUserService,
    UserExpoPushTokenRequestBody,
    UserVerifyRequestBody
} from "../interfaces";

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
    async verify(@Body() body: UserVerifyRequestBody): Promise<string> {
        const user = await this.userService.create(body);
        //TODO: Implement TPA KYC verification
        return user.userId;
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

    @Put(":userId/token")
    @ApiOperation({ summary: "Put user token" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async token(
        @Param("userId") userId: string,
        @Body() token: UserExpoPushTokenRequestBody
    ): Promise<User> {
        return this.userService.putToken(userId, token);
    }
}
