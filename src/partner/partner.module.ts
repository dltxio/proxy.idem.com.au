import { PartnerController } from "./partner.controller";
import { Module } from "@nestjs/common";
import { userProviders } from "../user/user.providers";
import { DatabaseModule } from "../data/database.module";
import { PartnerService } from "./partner.service";
import { DataSource } from "typeorm";
import { Partner } from "src/data/entities/partner.entity";

@Module({
    imports: [DatabaseModule],
    controllers: [PartnerController],
    providers: [
        ...userProviders,
        {
            provide: "IPartnerService",
            useClass: PartnerService
        },
        {
            provide: "PARTNER_REPOSITORY",
            useFactory: (dataSource: DataSource) =>
                dataSource.getRepository(Partner),
            inject: ["DATA_SOURCE"]
        },
        {
            provide: "REQUEST_REPOSITORY",
            useFactory: (dataSource: DataSource) =>
                dataSource.getRepository(Request),
            inject: ["DATA_SOURCE"]
        }
    ]
})
export class PartnerModule {}
