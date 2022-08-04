/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from "chai";
import { signMessage, verifyMessage } from "./wallet";

const mockConfigForWallet1: any = {
    get: () =>
        "afdfd9c3d2095ef696594f6cedcae59e72dcd697e2a7521b1578140422a4f890"
};

const mockConfigForWallet2: any = {
    get: () =>
        "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f"
};
const mockLogger: any = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    error: () => {}
};
describe("Test verifying message signature", async () => {
    it("Should verify message signature from same wallet", async () => {
        const message = {
            string: "Hello World",
            nestedObject: {
                name: "John Doe",
                age: 30
            }
        };
        const signature = await signMessage(
            JSON.stringify(message),
            mockConfigForWallet1,
            mockLogger
        );
        const isVerified = await verifyMessage(
            JSON.stringify(message),
            signature,
            mockConfigForWallet1,
            mockLogger
        );
        expect(isVerified).to.be.true;
    });

    it("Should not verify message signature from different wallet", async () => {
        const message = {
            string: "Hello World",
            nestedObject: {
                name: "John Doe",
                age: 30
            }
        };
        const signature = await signMessage(
            JSON.stringify(message),
            mockConfigForWallet1,
            mockLogger
        );
        const isVerified = await verifyMessage(
            JSON.stringify(message),
            signature,
            mockConfigForWallet2,
            mockLogger
        );
        expect(isVerified).to.be.false;
    });
});
