import fs from "fs";
import { DataSource } from "typeorm";

// Get the certificate from the environment variable or disk
const getCert = () => {
    if (process.env.CA_CERT) {
        return process.env.CA_CERT;
    }
    return fs.readFileSync(process.env.CA_CERT_PATH || "./ca-certificate.crt");
};

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
                ssl: getCert()
                    ? {
                          rejectUnauthorized: true,
                          ca: getCert()
                      }
                    : false
            });

            return dataSource.initialize();
        }
    }
];
