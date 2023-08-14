import {
    NotificationRequest,
    UserDto,
    IUserService,
    VerifyUserRequest,
    IAccountingService,
    SendInvoicesRequestBody,
    ResendEmailRequestBody,
    VerifyEmailRequestBody,
    IKYCService
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
import { KycResponse, UsersResponse } from "../types/general";
import { RegisterVerificationData } from "../types/greenId";

@Controller("users")
@UseGuards(LocalGuard)
export class UserController {
    constructor(
        @Inject("IUserService") private userService: IUserService,
        @Inject("IKYCService") private greenIdService: IKYCService,
        @Inject("IAccountingService")
        private xeroService: IAccountingService
    ) {}

    @Post("")
    @ApiOperation({ summary: "Create user" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async createUser(@Body() body: UserDto): Promise<void> {
        return this.userService.create(body);
    }

    @Post("verify-claims")
    @ApiOperation({ summary: "Verify claims" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async verify(@Body() body: VerifyUserRequest): Promise<KycResponse> {
        // const findUser = await this.userService.findOne(body.hashEmail);
        // if (!findUser) throw new Error("User not found");

        const greenIdUser: RegisterVerificationData = {
            ruleId: "default",
            name: body.fullName,
            currentResidentialAddress: body.address,
            dob: body.dob
        };

        const response = await this.greenIdService.verify({
            user: greenIdUser,
            licence: body.driversLicence,
            medicare: body.medicareCard
        });

        // CACHE RESPONSE IN DB

        const result = await this.greenIdService.formatReturnData(response);

        return result;
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

    @Post("notify")
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
    @Get(":email")
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
    async verifyEmail(@Body() body: VerifyEmailRequestBody): Promise<boolean> {
        return this.userService.verifyEmail(body);
    }

    // TODO:  Remove this should be on partner controller
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
    async sendInvoices(@Body() body: SendInvoicesRequestBody): Promise<string> {
        return this.xeroService.sendInvoices(body);
    }

    @ApiOperation({
        summary: "Resend email verification"
    })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    @Post("resend-email")
    async resendEmailVerification(
        @Body() body: ResendEmailRequestBody
    ): Promise<boolean> {
        return this.userService.resendEmailVerification(body.hashedEmail);
    }
}
