import { Module } from "@nestjs/common";
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
        }
    ]
})
export class UserModule {}
