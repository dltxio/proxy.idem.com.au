import { ethers } from "ethers";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IWalletService } from "../interfaces";

@Injectable()
export class WalletService implements IWalletService {
    private readonly logger = new Logger("WalletService");
    private wallet: ethers.Wallet;

    constructor(private config: ConfigService) {
        this.wallet = new ethers.Wallet(this.config.get("WALLET_PRIVATE_KEY"));
    }

    public async signMessage(message: string): Promise<string> {
        try {
            return this.wallet.signMessage(message);
        } catch (error) {
            this.logger.error(error);
            throw Error(error);
        }
    }
}
