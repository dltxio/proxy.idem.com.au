import { Inject, Injectable } from "@nestjs/common";
import { IExampleService } from "../interfaces";

@Injectable()
export class AccountsService {
    constructor(
        @Inject("IExampleService") public eventStore: IExampleService
    ) {}

    // Get a list of accounts
    public async getAll(): Promise<string[]> {
        return await this.eventStore.getAll();
    }

    // Get an account
    public async getById(id: string): Promise<string> {
        return await this.eventStore.getById(id);
    }
}
