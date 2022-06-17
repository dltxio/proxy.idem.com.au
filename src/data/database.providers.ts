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
                database: process.env.POSTGRES_DB_NAME,
                entities: [__dirname + "/../**/*.entity{.ts,.js}"],
                ssl: process.env.CA_CERT
                    ? {
                          rejectUnauthorized: true,
                          ca: process.env.CA_CERT
                      }
                    : false
            });

            return dataSource.initialize();
        }
    }
];
