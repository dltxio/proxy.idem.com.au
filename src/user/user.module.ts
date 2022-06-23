import { ThirdPartyService } from "./../services/ThirdPartyService";
import { Module } from "@nestjs/common";
import { AusPostService } from "../services/AusPostService";
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
            provide: "IAusPostService",
            useClass: AusPostService
        },
        {
            provide: "IThirdPartyService",
            useClass: ThirdPartyService
        }
    ]
})
export class UserModule {}
