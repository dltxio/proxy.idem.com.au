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

export const verifyMessage = async (
    message: string,
    signature: string,
    config: ConfigService,
    logger: Logger
) => {
    try {
        const wallet = new ethers.Wallet(
            config.get(ConfigSettings.WALLET_PRIVATE_KEY)
        );
        const expectedPublicKey = wallet.publicKey;

        const msgHash = ethers.utils.hashMessage(message);
        const msgHashBytes = ethers.utils.arrayify(msgHash);

        const recoveredPublicKey = ethers.utils.recoverPublicKey(
            msgHashBytes,
            signature
        );
        return expectedPublicKey === recoveredPublicKey;
    } catch (error) {
        logger.error(error);
        throw Error(error);
    }
};
