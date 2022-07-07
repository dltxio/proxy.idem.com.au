import { ThirdPartyService } from "./../services/ThirdPartyService";
import { Module } from "@nestjs/common";
import { KycService } from "../services/KycService";
import { DatabaseModule } from "../data/database.module";
import { UserController } from "./user.controller";
import { userProviders } from "./user.providers";
import { UserService } from "./user.service";

@Module({
    imports: [DatabaseModule],
    controllers: [UserController],
    providers: [
        ...userProviders,
        {
            provide: "IUserService",
            useClass: UserService
        },
        {
            provide: "IThirdPartyService",
            useClass: ThirdPartyService
        },
        {
            provide: "IKycService",
            useClass: KycService
        }
    ]
})
export class UserModule {}
