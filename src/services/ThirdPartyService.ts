import { IVendor, UserSignupRequest } from "./../interfaces";
import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Repository } from "typeorm";
import { Request } from "../data/entities/request.entity";
import { getVendorFromSitesJson, getVendorName } from "../utils/vendor";
import { verifyMessage } from "../utils/wallet";
import { GPIBVendor } from "./partners/GPIB";
import { CoinStashVendor } from "./partners/CoinStash";
import { EasyCryptoVendor } from "./partners/EasyCrypto";
import { DigitalSurgeVendor } from "./partners/DigitalSurge";
import {
    ConfigSettings,
    RequestType,
    SignupResponse,
    VendorEnum
} from "../types/general";

@Injectable()
export class ThirdPartyService {
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
}
