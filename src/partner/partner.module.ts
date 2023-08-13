import { PartnerController } from "./partner.controller";
import { Module } from "@nestjs/common";
import { userProviders } from "../user/user.providers";
import { DatabaseModule } from "../data/database.module";
import { PartnerService } from "./partner.service";

@Module({
    imports: [DatabaseModule],
    controllers: [PartnerController],
    providers: [
        ...userProviders,
        {
            provide: "IPartnerService",
            useClass: PartnerService
        }
    ]
})
export class PartnerModule {}
