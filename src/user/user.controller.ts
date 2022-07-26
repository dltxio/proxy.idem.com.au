import {
    IKycService,
    IThirdPartyService,
    KycResponse,
    KycResult,
    NewUser,
    RequestOtpRequest,
    RequestOtpResponse,
    SignupNotificationRequest,
    TestFlightRequest,
    UserDetailRequest,
    UserSignupRequest,
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
    Ip,
    UseGuards
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { User } from "../data/entities/user.entity";
import {
    IUserService,
    UserExpoPushTokenRequestBody,
    UserVerifyRequestBody
} from "../interfaces";
import { AuthGuard } from "@nestjs/passport";
import { Tester } from "../data/entities/tester.entity";

@Controller("user")
export class UserController {
    constructor(
        @Inject("IUserService") private userService: IUserService,
        @Inject("IKycService") private kycService: IKycService,
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
    @UseGuards(AuthGuard("basic"))
    @ApiOperation({ summary: "Verify user" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async verify(
        @Ip() ip: string,
        @Body() body: UserVerifyRequestBody
    ): Promise<KycResponse> {
        let user: User;
        const findUser = await this.userService.findOne(body.email);
        if (!findUser) {
            user = await this.userService.create({ email: body.email });
        } else {
            user = findUser;
        }

        //TODO: Implement Green ID KYC verification
        const response = await this.kycService.verify();

        //mock response
        response.thirdPartyVerified = true;
        response.userId = user.userId;

        return response;
    }

    @Get()
    @UseGuards(AuthGuard("basic"))
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
    @UseGuards(AuthGuard("basic"))
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
    @UseGuards(AuthGuard("basic"))
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
    @UseGuards(AuthGuard("basic"))
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

    @Post("signup")
    @UseGuards(AuthGuard("basic"))
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
    ): Promise<string> {
        return this.thirdPartyService.signup(body, ip);
    }

    @Post("syncDetail")
    @UseGuards(AuthGuard("basic"))
    @ApiOperation({ summary: "Sync user detail" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async syncDetail(@Body() body: UserDetailRequest): Promise<void> {
        return this.thirdPartyService.syncDetail(body);
    }

    @Post("tester")
    @ApiOperation({ summary: "request testflight tester" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async requestTest(@Body() body: TestFlightRequest): Promise<Tester> {
        return this.userService.requestToBeTester(body);
    }

    @Post("requestOtp")
    @UseGuards(AuthGuard("basic"))
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
        @Body() body: RequestOtpRequest
    ): Promise<RequestOtpResponse> {
        return this.userService.requestOtp(body);
    }
}
