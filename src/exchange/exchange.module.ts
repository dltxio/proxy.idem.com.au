import { ExchangeController } from "./exchange.controller";
import { Module } from "@nestjs/common";
import { userProviders } from "../user/user.providers";
import { DatabaseModule } from "../data/database.module";
import { DataSource } from "typeorm";
import { Partner } from "../data/entities/partner.entity";
import { PartnerService } from "src/partner/partner.service";
import { ExchangeService } from "./exchange.service";

@Module({
    imports: [DatabaseModule],
    controllers: [ExchangeController],
    providers: [
        ...userProviders,
        {
            provide: "IPartnerService",
            useClass: PartnerService
        },
        {
            provide: "IExchangeService",
            useClass: ExchangeService
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
export class ExchangeModule {}
