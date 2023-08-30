import { DataSource } from "typeorm";
import { User } from "../data/entities/user.entity";
import { Request } from "../data/entities/request.entity";
import { Partner } from "src/data/entities/partner.entity";

export const userProviders = [
    {
        provide: "USER_REPOSITORY",
        useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
        inject: ["DATA_SOURCE"]
    },
    {
        provide: "REQUEST_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(Request),
        inject: ["DATA_SOURCE"]
    },
    {
        provide: "PARTNER_REPOSITORY",
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(Partner),
        inject: ["DATA_SOURCE"]
    }
];
