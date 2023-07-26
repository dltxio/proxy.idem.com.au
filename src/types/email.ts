export type SimpleEmailParams = {
    to: string;
    toName: string;
    subject: string;
};

export type RawEmailParams = SimpleEmailParams & {
    text: string;
};
