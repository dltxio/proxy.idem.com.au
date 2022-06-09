import { Controller, Get, HttpStatus, Inject, Param } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { EcVaultAccount, IAccountsService } from "../interfaces";

@Controller("accounts")
export class AccountsController {
    constructor(
        @Inject("IAccountsService") private accountsService: IAccountsService
    ) {}

    @Get("")
    @ApiOperation({ summary: "Get the accounts" })
    @ApiResponse({
        status: HttpStatus.OK
        //type: //TODO: Add type
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async get(): Promise<EcVaultAccount[]> {
        return await this.accountsService.getAll();
    }

    @Get("/:accountId")
    @ApiOperation({
        summary: "Get account by id"
    })
    @ApiResponse({
        status: HttpStatus.OK
        //type: //TODO: Add type
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST
    })
    async getVaultAccountAssets(@Param("accountId") accountId: string) {
        return await this.accountsService.getById(accountId);
    }
}
