import { Inject, Injectable, Logger } from "@nestjs/common";
import { Request } from "../data/entities/request.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import {
    ConfigSettings,
    RequestType,
    SignupResponse,
    VendorEnum
} from "../types/general";
import { Partner } from "src/data/entities/partner.entity";
import { IPartnerService, IVendor, UserSignupRequest } from "src/interfaces";
import { HttpsProxyAgent } from "https-proxy-agent";
import axios, { AxiosInstance } from "axios";
import { GPIBVendor } from "src/services/partners/GPIB";
import { CoinStashVendor } from "../services/partners/CoinStash";
import { EasyCryptoVendor } from "../services/partners/EasyCrypto";
import { DigitalSurgeVendor } from "../services/partners/DigitalSurge";
import { getVendorFromSitesJson } from "src/utils/vendor";
import { verifyMessage } from "src/utils/wallet";

@Injectable()
export class PartnerService implements IPartnerService {
    private readonly logger = new Logger("PartnerService");
    private axiosWithProxy: AxiosInstance;

    constructor(
        @Inject("PARTNER_REPOSITORY")
        private partnerRepository: Repository<Partner>,
        @Inject("REQUEST_REPOSITORY")
        private requestRepository: Repository<Request>,
        private readonly config: ConfigService
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

    public async get(): Promise<Partner[]> {
        return await this.partnerRepository.find();
    }

    public async getById(vendorId: number): Promise<Partner> {
        return await this.partnerRepository.findOne({
            where: { id: vendorId }
        });
    }

    public async getByEmail(email: string): Promise<Partner> {
        return await this.partnerRepository.findOne({
            where: { email: email }
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

    public async requests(): Promise<Request[]> {
        return await this.requestRepository.find();
    }

    public async signUp(
        signupInfo: UserSignupRequest,
        ip: string
    ): Promise<SignupResponse> {
        const vendorFromSitesJson = getVendorFromSitesJson(signupInfo.source);
        if (vendorFromSitesJson.verifyClaims) {
            const { verification } = signupInfo;
            const { hashedPayload, signature } = verification;
            const isVerified = verifyMessage(
                hashedPayload,
                signature,
                this.config,
                this.logger
            );
            if (!isVerified) {
                throw new Error("Verification signature is not valid");
            }
        }

        const vendor = this.getVendor(signupInfo.source);
        // await this.partnerRepository.findOne( { name: vendor.name } );

        try {
            const { userId, password } = await vendor.signUp(signupInfo);
            this.logger.verbose(
                `New user signup for ${vendor.name}, userId: ${userId}`
            );
            //Save the signup request
            await this.requestRepository.save({
                from: "IDEM",
                // to: getVendorName(signupInfo.source),
                ipAddress: ip,
                requestType: RequestType.Signup
            });

            return { userId: userId, password: password };
        } catch (error) {
            this.logger.error(error.message);
            throw new Error(error.message);
        }
    }
}
