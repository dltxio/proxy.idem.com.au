import { ConfigService } from "@nestjs/config";
import * as openpgp from "openpgp";
import { ConfigSettings } from "../types/general";
import * as fs from "fs";

export const getPrivateKey = async (
    config: ConfigService
): Promise<openpgp.PrivateKey> => {
    try {
        const privateKeyArmored = fs.readFileSync(
            config.get(ConfigSettings.PGP_PRIVATE_KEY),
            "utf8"
        );

        if (!privateKeyArmored) throw new Error("Idem PGP key not found");

        if (!privateKeyArmored)
            throw new Error("sendRawEmail: Idem PGP key not found");

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
