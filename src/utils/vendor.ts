import { ConfigService } from "@nestjs/config";
import { ConfigSettings, VendorEnum } from "../types/general";
import sites from "../utils/sites.json";

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

export enum VendorName {
    GPIB = "Get Paid In Bitcoin",
    CoinStash = "Coin Stash",
    EasyCrypto = "Easy Crypto",
    DigitalSurge = "Digital Surge"
}

export type Vendor = {
    id: number;
    description: string;
    logo: string;
    name: string;
    signup: string;
    tagline: string;
    website: string;
    backgroundColor: string;
    requiredClaimTypes: RequiredClaimType[];
    useProxy: boolean;
    tempPassword: boolean;
    passwordComplexity: string;
    verifyClaims: boolean;
    enabled: boolean;
};

export type RequiredClaimType = {
    type: ClaimType;
    verified: boolean;
};

export type ClaimType =
    | "AdultCredential"
    | "BirthCredential"
    | "NameCredential"
    | "EmailCredential"
    | "MobileCredential"
    | "AddressCredential"
    | "TaxCredential"
    | "ProfileImageCredential";
