import { DataSource } from "typeorm";

export const databaseProviders = [
    {
        provide: "DATA_SOURCE",
        useFactory: async () => {
            const dataSource = new DataSource({
                type: "postgres",
                host: process.env.POSTGRES_HOST,
                port: Number(process.env.POSTGRES_PORT),
                username: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                database: process.env.DATABASE,
                entities: [__dirname + "/../**/*.entity{.ts,.js}"],
                synchronize: true
            });

            return dataSource.initialize();
        }
    }
];
