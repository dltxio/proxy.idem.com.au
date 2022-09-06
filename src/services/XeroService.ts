import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Logger } from "ethers/lib/utils";
import { Repository } from "typeorm";
import { Request } from "../data/entities/request.entity";
import { Contact, XeroClient, LineItem, Invoice, Invoices } from "xero-node";
import {
    ConfigSettings,
    IXeroService,
    XeroTokenSet,
    XeroClients
} from "../interfaces";

const XERO_SCOPES =
    "openid profile email accounting.transactions accounting.contacts offline_access";
const XERO_INVOICE_DESCRIPTION = "KYC";

@Injectable()
export class XeroService implements IXeroService {
    private client: XeroClient;
    private readonly logger = new Logger("XeroService");
    private accountCode;
    private price;
    private tenantId;
    private gpibId;

    constructor(
        private config: ConfigService,
        @Inject("REQUEST_REPOSITORY")
        private requestRepository: Repository<Request>
    ) {
        this.client = new XeroClient({
            clientId: this.config.get(ConfigSettings.XERO_CLIENT_ID) ?? "",
            clientSecret:
                this.config.get(ConfigSettings.XERO_CLIENT_SECRET) ?? "",
            scopes: XERO_SCOPES.split(" ")
        });
        this.accountCode =
            this.config.get(ConfigSettings.XERO_SALES_CODE) ?? "";
        this.price = this.config.get(ConfigSettings.XERO_PRICE) ?? "";
        this.tenantId = this.config.get(ConfigSettings.XERO_TENANT_ID) ?? "";
        this.gpibId = this.config.get(ConfigSettings.XERO_GPIB_ID) ?? "";
    }

    public async sendInvoices(authToken: XeroTokenSet): Promise<string> {
        try {
            // set the auth token from the POST request body
            this.client.setTokenSet(authToken);

            // create initial xero constants that won't change
            const contact: Contact = {
                contactID: this.gpibId
            };

            // get requests from the request db
            const totalRequests = await this.requestRepository.count({
                where: {
                    to: XeroClients.GPIB_NAME
                }
            });

            // construct a line item for all KYC invoices
            const lineItems: LineItem[] = [
                {
                    description: XERO_INVOICE_DESCRIPTION,
                    quantity: totalRequests,
                    unitAmount: +this.price,
                    accountCode: this.accountCode
                }
            ];

            // construct invoices object that contains single invoice for vendor
            const invoices: Invoices = {
                invoices: [
                    {
                        type: Invoice.TypeEnum.ACCREC,
                        contact,
                        date: new Date().toLocaleDateString("en-US"),
                        lineItems,
                        reference: `${XeroClients.GPIB_NAME} Invoice`,
                        status: Invoice.StatusEnum.DRAFT
                    }
                ]
            };

            // create xero invoices
            await this.client.accountingApi.createInvoices(
                this.tenantId,
                invoices
            );

            // user-facing success message
            this.logger.debug("Invoices sent");
            return "Invoices sent";
        } catch (err: unknown) {
            this.logger.debug("Error when sending invoices", err);
            throw new Error(JSON.stringify(err));
        }
    }
}
