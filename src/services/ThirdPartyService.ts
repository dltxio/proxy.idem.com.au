import {
    IVendor,
    RequestType,
    UserSignupRequest,
    VendorEnum
} from "./../interfaces";
import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ConfigSettings, IThirdPartyService } from "../interfaces";
import { Repository } from "typeorm";
import { Request } from "../data/entities/request.entity";
import { getVendorName } from "../utils/vendor";
import { verifyMessage } from "../utils/wallet";
import {
    GPIBVendor,
    CoinStashVendor,
    EasyCryptoVendor,
    DigitalSurgeVendor
} from "./vendors";

@Injectable()
export class ThirdPartyService implements IThirdPartyService {
    private readonly logger = new Logger("ThirdPartyService");
    private axiosWithProxy: AxiosInstance;

    constructor(
        private config: ConfigService,
        @Inject("REQUEST_REPOSITORY")
        private requestRepository: Repository<Request>
    ) {
        const proxyUsername = this.config.get(
            ConfigSettings.HTTPS_PROXY_USERNAME
        );
        const proxyPassword = this.config.get(
            ConfigSettings.HTTPS_PROXY_PASSWORD
        );
        this.axiosWithProxy = axios.create({
            headers: {
                "Content-Type": "application/json"
            },
            httpsAgent: new HttpsProxyAgent({
                host: this.config.get(ConfigSettings.HTTPS_PROXY_HOST),
                port: this.config.get(ConfigSettings.HTTPS_PROXY_PORT),
                auth: `${proxyUsername}:${proxyPassword}`
            })
        });
    }

    private getVendor(vendorId: number): IVendor {
        switch (vendorId) {
            case VendorEnum.GPIB:
                return new GPIBVendor(this.config, this.axiosWithProxy);
            case VendorEnum.CoinStash:
                return new CoinStashVendor(this.config, this.axiosWithProxy);
            case VendorEnum.EasyCrypto:
                return new EasyCryptoVendor(this.config, this.axiosWithProxy);
            case VendorEnum.DigitalSurge:
                return new DigitalSurgeVendor(this.config, this.axiosWithProxy);
            default:
                throw new Error("Invalid vendor id");
        }
    }

    public async signUp(
        signupInfo: UserSignupRequest,
        ip: string
    ): Promise<string> {
        const { verification, source } = signupInfo;
        const { message, signature } = verification;

        const isVerified = verifyMessage(
            JSON.stringify(message),
            signature,
            this.config,
            this.logger
        );
        if (!isVerified) {
            throw new Error("Verification signature is not valid");
        }

        const vendor = this.getVendor(source);
        try {
            const { userId } = await vendor.signUp(signupInfo);
            this.logger.verbose(
                `New user signup for ${vendor.name}, userId: ${userId}`
            );
            //Save the signup request
            await this.requestRepository.save({
                from: "IDEM",
                to: getVendorName(source),
                ipAddress: ip,
                requestType: RequestType.Signup
            });

            return userId;
        } catch (error) {
            this.logger.error(error.message);
            throw new Error(error.message);
        }
    }
}
