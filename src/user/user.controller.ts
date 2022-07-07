import {
    IKycService,
    IThirdPartyService,
    KycResponse,
    KycResult,
    NewUser,
    SignupNotificationRequest,
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
        console.log(body);
        const findUser = await this.userService.findOne(body.email);
        if (!findUser) {
            user = await this.userService.create({ email: body.email });
        } else {
            user = findUser;
        }
        const response = await this.kycService.verify();
        console.log(response);

        if (response.result === KycResult.Completed) {
            //TODO: Call GPIB to verify user
            await this.thirdPartyService.verifyGPIB(body, ip);
            response.thirdPartyVerified = true;
            response.userId = user.userId;
        }
        //TODO: Implement TPA KYC verification
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
}
