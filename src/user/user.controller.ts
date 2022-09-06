import {
    IKycService,
    KycResponse,
    NotificationRequest,
    UserDto,
    UsersResponse,
    IUserService,
    VerifyUserRequest
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
    UseGuards
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { User } from "../data/entities/user.entity";
import { Public } from "../auth/anonymous";
import { LocalGuard } from "../auth/auth-local.guard";
import { hashMessage } from "ethers/lib/utils";
@Controller("users")
@UseGuards(LocalGuard)
export class UserController {
    constructor(
        @Inject("IUserService") private userService: IUserService,
        @Inject("IKycService") private kycService: IKycService
    ) {}

    @Post("create")
    @ApiOperation({ summary: "Create user" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async create(@Body() body: UserDto): Promise<User> {
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
    async verify(@Body() body: VerifyUserRequest): Promise<KycResponse> {
        let user: User;
        const findUser = await this.userService.findOne(body.hashEmail);
        if (!findUser) {
            user = await this.userService.create({
                email: body.hashEmail,
                expoToken: "",
                pgpPublicKey: ""
            });
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

    @Get("")
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

    @Put(":email")
    @ApiOperation({ summary: "Update user" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async update(
        @Param("email") email: string,
        @Body() requestBody: UserDto
    ): Promise<User> {
        return this.userService.update(email, requestBody);
    }

    @Post("notification")
    @ApiOperation({ summary: "Push notification" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async pushNotifications(
        @Body() request: NotificationRequest
    ): Promise<void> {
        return this.userService.pushNotifications(request.message);
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
    @Get("/:email")
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
        return this.userService.verifyEmail(token);
    }
}
