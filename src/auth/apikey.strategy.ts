import { HeaderAPIKeyStrategy } from "passport-headerapikey";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
    HeaderAPIKeyStrategy,
    "api-key"
) {
    constructor(
        private configService: ConfigService
    ) {
        const headerKeyApiKey =
            configService.get<string>("HEADER_KEY_API_KEY") || "";

        super(
            { header: headerKeyApiKey, prefix: "" },
            true,
            async (apiKey, done) => {
                // if (this.authService.validateApiKey(apiKey)) {
                //     done(null, true);
                // }
                done(new UnauthorizedException(), null);
            }
        );
    }
}
