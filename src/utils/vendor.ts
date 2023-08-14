import { ConfigService } from "@nestjs/config";
import { ConfigSettings, VendorEnum } from "../types/general";
import sites from "../utils/sites.json";
import { VendorName } from "src/interfaces";

export const getVendorFromSitesJson = (venderId: number) => {
    const vendor = sites.find(site => site.id === venderId);
    if (!vendor) {
        throw new Error(`Vendor ${venderId} not found`);
    }
    return vendor;
};

export const getVendorName = (vendor: number) => {
    switch (vendor) {
        case VendorEnum.GPIB:
            return VendorName.GPIB;
        case VendorEnum.CoinStash:
            return VendorName.CoinStash;
        case VendorEnum.EasyCrypto:
            return VendorName.EasyCrypto;
        case VendorEnum.DigitalSurge:
            return VendorName.DigitalSurge;
        default:
            return undefined;
    }
};

export const getVendorId = (vendor: VendorEnum, config: ConfigService) => {
    let contactID: string, contactName: VendorName;
    switch (vendor) {
        case VendorEnum.GPIB:
            contactID = config.get(ConfigSettings.XERO_GPIB_ID);
            contactName = getVendorName(vendor);
            break;
    }

    return {
        contactID,
        contactName
    };
};
