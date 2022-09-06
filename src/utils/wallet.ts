import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ethers } from "ethers";
import { ConfigSettings } from "../types";

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

export const verifyMessage = (
    hashedPayload: string,
    signature: string,
    config: ConfigService,
    logger: Logger
) => {
    try {
        const wallet = new ethers.Wallet(
            config.get(ConfigSettings.WALLET_PRIVATE_KEY)
        );
        const expectedPublicKey = wallet.publicKey;
        const msgHash = ethers.utils.hashMessage(hashedPayload);
        const msgHashBytes = ethers.utils.arrayify(msgHash);

        const recoveredPublicKey = ethers.utils.recoverPublicKey(
            ethers.utils.arrayify(msgHashBytes),
            signature
        );
        return expectedPublicKey === recoveredPublicKey;
    } catch (error) {
        logger.error(error);
        throw Error(error);
    }
};
