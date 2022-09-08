import {
    IKycService,
    IThirdPartyService,
    IXeroService,
    KycResponse,
    NewUser,
    PublicKeyDto,
    RequestOtpRequest,
    RequestOtpResponse,
    SendInvoicesRequest,
    SignupNotificationRequest,
    SignupResponse,
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
    UseGuards
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
import { LocalGuard } from "../auth/auth-local.guard";
import { hashMessage } from "ethers/lib/utils";
@Controller("user")
@UseGuards(LocalGuard)
export class UserController {
    constructor(
        @Inject("IUserService") private userService: IUserService,
        @Inject("IKycService") private kycService: IKycService,
        @Inject("IThirdPartyService")
        private thirdPartyService: IThirdPartyService,
        @Inject("IXeroService")
        private xeroService: IXeroService
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
        let user: User;
        const findUser = await this.userService.findOne(body.hashEmail);
        if (!findUser) {
            user = await this.userService.create({ email: body.hashEmail });
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
    ): Promise<SignupResponse> {
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
        const formattedEmail = email.trim().toLowerCase();
        const hashEmail = hashMessage(formattedEmail);
        return this.userService.findOne(hashEmail);
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
    @Post("verify-email")
    async verifyEmail(@Body("token") token: string): Promise<boolean> {
        const email = await this.userService.decodeEmailFromToken(token);
        return this.userService.verifyEmail(email, token);
    }

    @ApiOperation({
        summary: "Send invoices"
    })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    @Post("send-invoices")
    async sendInvoices(@Body() body: SendInvoicesRequest): Promise<string> {
        return this.xeroService.sendInvoices(body);
    }
}
