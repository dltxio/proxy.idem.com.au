import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { AccountsModule } from "../src/accounts/accounts.module";
import { INestApplication } from "@nestjs/common";
import { ExampleService } from "../src/services/EventStore.service";
import { ConfigModule } from "@nestjs/config";

jest.setTimeout(90000);

describe("Accounts", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                AccountsModule,
                ConfigModule.forRoot({
                    isGlobal: true
                })
            ],
            providers: [
                ExampleService,
                {
                    provide: "IExampleService",
                    useClass: ExampleService
                }
            ]
        }).compile();
        app = module.createNestApplication();
        await app.init();
    });

    it(`/GET accounts`, async () => {
        const response = await request(app.getHttpServer())
            .get("/accounts")
            .expect("Content-Type", /json/)
            .expect(200);

        // there should be around 113 accounts
        expect(response.body.length).toBeGreaterThan(100);
    });

    it(`/GET accounts/:id`, async () => {
        const id = "1";
        const response = await request(app.getHttpServer())
            .get(`/accounts/${id}`)
            .expect("Content-Type", /json/)
            .expect(200);

        // there should be 1 ("Test") account
        expect(response.body.id).toBe(id);
        expect(response.body.name).toBe("Test");
    });

    afterAll(async () => {
        await app.close();
    });
});
