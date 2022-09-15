import { ConfigService } from "@nestjs/config";
import * as openpgp from "openpgp";
import { ConfigSettings } from "src/interfaces";

export const getPrivateKey = async (
    config: ConfigService
): Promise<openpgp.PrivateKey> => {
    try {
        const privateKeyArmored = config.get(ConfigSettings.PGP_PRIVATE_KEY);

        if (!privateKeyArmored) throw new Error("Idem PGP key not found");

        const privateKeys = await openpgp.readPrivateKeys({
            armoredKeys: privateKeyArmored
        });

        const passphrase = config.get(ConfigSettings.PGP_PASSPHRASE) as string;

        const privateKey = await openpgp.decryptKey({
            privateKey: privateKeys[0],
            passphrase
        });

        return privateKey;
    } catch (error) {
        throw new Error(error);
    }
};
