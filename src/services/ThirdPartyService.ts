import {
    RequestType,
    UserDetailRequest,
    UserSignupRequest,
    VendorEnum
} from "./../interfaces";
import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosError, AxiosInstance } from "axios";
import { ConfigSettings, IThirdPartyService } from "../interfaces";
import { Repository } from "typeorm";
import { Request } from "../data/entities/request.entity";
import { getVendorName } from "../utils/vendor";
import moment from "moment";
import { verifyMessage } from "../utils/wallet";

@Injectable()
export class ThirdPartyService implements IThirdPartyService {
    private readonly logger = new Logger("ThirdPartyService");
    private axiosWithProxy: AxiosInstance;

    constructor(
        private config: ConfigService,
        @Inject("REQUEST_REPOSITORY")
        private requestRepository: Repository<Request>
    ) {
        this.axiosWithProxy = axios.create({
            headers: {
                "Content-Type": "application/json"
            },
            proxy: {
                protocol: "https",
                host: this.config.get(ConfigSettings.HTTPS_PROXY_HOST),
                port: this.config.get(ConfigSettings.HTTPS_PROXY_PORT),
                auth: {
                    username: this.config.get(
                        ConfigSettings.HTTPS_PROXY_USERNAME
                    ),
                    password: this.config.get(
                        ConfigSettings.HTTPS_PROXY_PASSWORD
                    )
                }
            }
        });
    }

    private getSignupRequestParams(signupInfo: UserSignupRequest): {
        requestBody: any;
        endPoint: string;
        headers?: any;
    } {
        const { source, firstName, lastName, email, password, phoneNumber } =
            signupInfo;

        switch (source) {
            case VendorEnum.GPIB:
                return {
                    endPoint: `${this.config.get(
                        ConfigSettings.GPIB_API_ENDPOINT
                    )}/user`,
                    requestBody: {
                        firstName,
                        lastName,
                        email,
                        password,
                        referralCode: "",
                        trackAddress: true,
                        createAddress: true
                    }
                };
            case VendorEnum.CoinStash:
                return {
                    endPoint: this.config.get(
                        ConfigSettings.COINSTASH_SIGNUP_ENDPOINT
                    ),
                    requestBody: {
                        email,
                        password,
                        displayName: `${firstName} ${lastName}`,
                        country: "Australia",
                        token: this.config.get(ConfigSettings.COINSTASH_TOKEN),
                        acceptMarketing: false
                    }
                };
            case VendorEnum.EasyCrypto:
                return {
                    endPoint: this.config.get(
                        ConfigSettings.EC_SIGNUP_ENDPOINT
                    ),
                    requestBody: {
                        email,
                        password,
                        returnSecureToken: true
                    }
                };
            case VendorEnum.DigitalSurge:
                return {
                    endPoint: this.config.get(
                        ConfigSettings.DIGITALSURGE_SIGNUP_ENDPOINT
                    ),
                    requestBody: {
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                        phone_number: phoneNumber
                    },
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.config.get(
                            ConfigSettings.DIGITALSURGE_PARTNER_TOKEN
                        )}`
                    }
                };
            default:
                throw new Error("Invalid vendor id");
        }
    }

    public async signup(
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

        const { requestBody, endPoint, headers } =
            this.getSignupRequestParams(signupInfo);
        try {
            const response = await this.axiosWithProxy.post(
                endPoint,
                JSON.stringify(requestBody),
                {
                    headers: headers ?? {
                        "Content-Type": "application/json"
                    }
                }
            );
            this.logger.verbose(
                `New user signup for ${source}, userId: ${response.data}`
            );
            //Save the signup request
            await this.requestRepository.save({
                from: "IDEM",
                to: getVendorName(source),
                ipAddress: ip,
                requestType: RequestType.Signup
            });
            return response.data;
        } catch (error) {
            this.logger.error(error.response.data);
            throw new Error(error.response.data);
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
