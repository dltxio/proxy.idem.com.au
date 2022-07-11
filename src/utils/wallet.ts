import { ConfigSettings } from "./../interfaces";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ethers } from "ethers";

export const signMessage = async (
    message: string,
    config: ConfigService,
    logger: Logger
) => {
    try {
        const wallet = new ethers.Wallet(
            config.get(ConfigSettings.WALLET_PRIVATE_KEY)
        );
        return wallet.signMessage(message);
    } catch (error) {
        logger.error(error);
        throw Error(error);
    }
};
