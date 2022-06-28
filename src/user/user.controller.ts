import {
    IAusPostService,
    IThirdPartyService,
    KycResponse,
    KycResult,
    NewUser,
    SignupNotificationRequest,
    UsersResponse
} from "./../interfaces";
import {
    Controller,
    Inject,
    Post,
    HttpStatus,
    Body,
    Get,
    Param,
    Put,
    Ip
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

    @Post("")
    @ApiOperation({ summary: "Create user" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async create(@Body() body: NewUser): Promise<User> {
        return this.userService.create(body);
    }

    @Post("verify")
    @ApiOperation({ summary: "Verify user" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async verify(@Body() body: UserVerifyRequestBody): Promise<KycResponse> {
        const user = await this.userService.findOne(body.email);
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
    async getAll(): Promise<UsersResponse[]> {
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
    async pushNotifications(@Param("message") message: string): Promise<void> {
        return this.userService.pushNotifications(message);
    }

    @Post("signup/notification")
    @ApiOperation({ summary: "Push signup notification" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async pushSignupNotification(
        @Ip() ip: string,
        @Body() signupRequest: SignupNotificationRequest
    ): Promise<void> {
        return this.userService.pushSignupNotification(signupRequest, ip);
    }
}
