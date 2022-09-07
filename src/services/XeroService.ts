import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Logger } from "ethers/lib/utils";
import { Repository } from "typeorm";
import { Request } from "../data/entities/request.entity";
import { Contact, XeroClient, LineItem, Invoice, Invoices } from "xero-node";
import {
    ConfigSettings,
    IXeroService,
    VendorEnum,
    XeroTokenSet
} from "../interfaces";
import { getVendorName, VendorName } from "../utils/vendor";

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
        // other xero contact ID's will go here as they are added to IDEM
    }

    public async sendInvoices(
        authToken: XeroTokenSet,
        vendor: VendorEnum
    ): Promise<string> {
        try {
            // set the auth token from the POST request body
            this.client.setTokenSet(authToken);

            // create xero contact
            let contactID: string, contactName: VendorName;
            switch (vendor) {
                case VendorEnum.GPIB:
                    contactID = this.gpibId;
                    contactName = getVendorName(vendor);
                    break;
                // add more cases as vendors get added
            }

            const contact: Contact = {
                contactID
            };

            // get requests from the request db
            const totalRequests = await this.requestRepository.count({
                where: {
                    to: contactName
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
                        reference: `${contactName} Invoice`,
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