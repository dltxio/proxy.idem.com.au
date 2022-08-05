import {
    RequestType,
    UserDetailRequest,
    UserSignupRequest,
    VendorEnum
} from "./../interfaces";
import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosError } from "axios";
import { ConfigSettings, IThirdPartyService } from "../interfaces";
import { Repository } from "typeorm";
import { Request } from "../data/entities/request.entity";
import { getVendorName } from "../utils/vendor";
import moment from "moment";
import { verifyMessage } from "../utils/wallet";

@Injectable()
export class ThirdPartyService implements IThirdPartyService {
    private readonly logger = new Logger("ThirdPartyService");

    constructor(
        private config: ConfigService,
        @Inject("REQUEST_REPOSITORY")
        private requestRepository: Repository<Request>
    ) {}

    private getSignupRequestBodyAndEndPoint(signupInfo: UserSignupRequest): {
        requestBody: any;
        endPoint: string;
    } {
        const { source, firstName, lastName, email, password } = signupInfo;

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

        const { requestBody, endPoint } =
            this.getSignupRequestBodyAndEndPoint(signupInfo);
        try {
            const response = await axios.post(
                endPoint,
                JSON.stringify(requestBody),
                {
                    headers: {
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

            const authentication = await axios
                .post(
                    `${endPoint}/user/authenticate`,
                    JSON.stringify({
                        username: userDetail.email,
                        password: userDetail.password
                    }),
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )
                .catch((error: AxiosError) => {
                    this.logger.error(error);
                    throw new Error(error.message);
                });
            if (authentication.status === 200) {
                const token = authentication.data.token;

                await axios
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
