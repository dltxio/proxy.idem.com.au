import {
    IAusPostService,
    IThirdPartyService,
    KycResponse,
    KycResult
} from "./../interfaces";
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
    constructor(
        @Inject("IUserService") private userService: IUserService,
        @Inject("IAusPostService") private ausPostService: IAusPostService,
        @Inject("IThirdPartyService")
        private thirdPartyService: IThirdPartyService
    ) {}

    @Post("verify")
    @ApiOperation({ summary: "Verify user" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async verify(@Body() body: UserVerifyRequestBody): Promise<KycResponse> {
        const user = await this.userService.create(body);
        const result = await this.ausPostService.verify(body);
        const response: KycResponse = {
            result: result,
            userId: user.userId,
            thirdPartyVerified: false
        };
        if (result === KycResult.Completed) {
            //TODO: Call GPIB to verify user
            await this.thirdPartyService.verifyGPIB(body);
            response.thirdPartyVerified = true;
        }
        //TODO: Implement TPA KYC verification
        return response;
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

    @Post("notification/:message")
    @ApiOperation({ summary: "Push notification" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async PushNotification(@Param("message") message: string): Promise<void> {
        return this.userService.pushNotification(message);
    }
}
