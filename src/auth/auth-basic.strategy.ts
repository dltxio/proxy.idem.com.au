import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { BasicStrategy as Strategy } from "passport-http";

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly config: ConfigService) {
        super({
            passReqToCallback: true
        });
    }

    public validate = async (req, username, password): Promise<boolean> => {
        console.log("username", username);
        console.log("password", password);

        return true;
        // if (
        //     this.config.get<string>("HTTP_BASIC_USER") === username &&
        //     this.config.get<string>("HTTP_BASIC_PASS") === password
        // ) {
        //     return true;
        // }
        // throw new UnauthorizedException();
    };
}
