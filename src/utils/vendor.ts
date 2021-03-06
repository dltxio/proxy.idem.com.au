import { VendorEnum } from "./../interfaces";
export const getVendorName = (vendor: number) => {
    switch (vendor) {
        case VendorEnum.GPIB:
            return VendorName.GPIB;
        case VendorEnum.CoinStash:
            return VendorName.CoinStash;
        case VendorEnum.EasyCrypto:
            return VendorName.EasyCrypto;
        default:
            return undefined;
    }
};

export enum VendorName {
    GPIB = "Get Paid In Bitcoin",
    CoinStash = "Coin Stash",
    EasyCrypto = "Easy Crypto"
}
