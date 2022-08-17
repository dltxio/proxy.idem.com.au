import {
    RequestType,
    UserDetailRequest,
    UserSignupRequest,
    Vendor,
    VendorEnum
} from "./../interfaces";
import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosError, AxiosInstance } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ConfigSettings, IThirdPartyService } from "../interfaces";
import { Repository } from "typeorm";
import { Request } from "../data/entities/request.entity";
import { getVendorName } from "../utils/vendor";
import moment from "moment";
import { verifyMessage } from "../utils/wallet";
import { GPIBVendor } from "./vendors/GPIB";
import { CoinStashVendor } from "./vendors/CoinStash";
import { EasyCryptoVendor } from "./vendors/EasyCrypto";
import { DigitalSurgeVendor } from "./vendors/DigitalSurge";

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

    private getVendor(vendorId: number): Vendor {
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
                `New user signup for ${source}, userId: ${userId}`
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

    public async syncDetail(userDetail: UserDetailRequest): Promise<void> {
        let endPoint: string;
        if (userDetail.source === VendorEnum.GPIB) {
            endPoint = this.config.get(ConfigSettings.GPIB_API_ENDPOINT);

            const authentication = await this.axiosWithProxy
                .post(
                    `${endPoint}/user/authenticate`,
                    JSON.stringify({
                        username: userDetail.email,
                        password: userDetail.password
                    })
                )
                .catch((error: AxiosError) => {
                    this.logger.error(error);
                    throw new Error(error.message);
                });
            if (authentication.status === 200) {
                const token = authentication.data.token;

                await this.axiosWithProxy
                    .put(
                        `${endPoint}/accountInfoes`,
                        JSON.stringify({
                            firstName: userDetail.firstName,
                            lastName: userDetail.lastName,
                            yob: moment(userDetail.dob, "DD/MM/YYYY").year()
                        }),
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )
                    .catch((error: AxiosError) => {
                        this.logger.error(error);
                        throw new Error(error.message);
                    });
            }
        }
        return;
    }
}
