import { ExchangeController } from "./exchange.controller";
import { Module } from "@nestjs/common";
import { ThirdPartyService } from "../services/ThirdPartyService";
import { userProviders } from "../user/user.providers";
import { DatabaseModule } from "../data/database.module";
import { ExchangeService } from "./exchange.service";

@Module({
    imports: [DatabaseModule],
    controllers: [ExchangeController],
    providers: [
        ...userProviders,
        {
            provide: "IThirdPartyService",
            useClass: ThirdPartyService
        },
        {
            provide: "IExchangeService",
            useClass: ExchangeService
        }
    ]
})
export class ExchangeModule {}
