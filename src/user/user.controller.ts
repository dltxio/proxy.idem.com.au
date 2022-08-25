import {
    IKycService,
    IThirdPartyService,
    KycResponse,
    NewUser,
    PublicKeyDto,
    RequestOtpRequest,
    RequestOtpResponse,
    SignupNotificationRequest,
    TestFlightRequest,
    UserSignupRequest,
    UsersResponse,
    VerifyOtpRequest
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
    UseGuards,
    Res,
    Query
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { User } from "../data/entities/user.entity";
import {
    IUserService,
    UserExpoPushTokenRequestBody,
    UserVerifyRequestBody
} from "../interfaces";
import { Tester } from "../data/entities/tester.entity";
import { Public } from "../auth/anonymous";
import { LocalGuard } from "src/auth/auth-anonymous.guard";
import { Response } from "express";
@Controller("user")
@UseGuards(LocalGuard)
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
    ): Promise<string> {
        return this.thirdPartyService.signUp(body, ip);
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

    @Post("verifyOtp")
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
    async verifyOtp(@Body() body: VerifyOtpRequest): Promise<boolean> {
        return this.userService.verifyOtp(body);
    }

    @ApiOperation({
        summary: "User upload PGP public key"
    })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    @Post("key/add")
    async addPublicKey(@Body() body: PublicKeyDto): Promise<boolean> {
        return this.userService.addPublicKey(body);
    }

    @ApiOperation({
        summary: "Get user detail"
    })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    @Get("/email/:email")
    async getUser(
        @Param("email") email: string
    ): Promise<UsersResponse | undefined> {
        return this.userService.findOne(email);
    }

    @Public()
    @ApiOperation({
        summary: "Verify email"
    })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    @Get("verify-email")
    async verifyEmail(
        @Query("email") email: string,
        @Query("token") token: string,
        @Res() res: Response
    ): Promise<void> {
        return res.render("verifyEmailResponse", {
            isSuccess: false,
            title: "Oops",
            message: `There was a problem verifying ${email}`
        });
        const isSuccess = await this.userService.verifyEmail(email, token);
        if (!isSuccess) {
            return res.render("verifyEmailResponse", {
                isSuccess: false,
                title: "Oops",
                message: `There was a problem verifying ${email}`
            });
        }
        return res.render("verifyEmailResponse", {
            isSuccess: true,
            title: "Success",
            message: `${email} has been verified`
        });
    }
}
