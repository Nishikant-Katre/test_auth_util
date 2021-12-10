import { ErrorEntity, HttpStatus } from "../..";


export class SupportedEmailProviders {
    static SENDGRID = "SENDGRID";
    static SMTP = "SMTP";
    static REST = "REST";
    static default(): string {
        return this.SMTP;
    }
    static validate(val: string) {
        const vals_allowed = Object.values(SupportedEmailProviders);
        if (!vals_allowed.find(c => c.toLowerCase() == val.toLowerCase())) {
            throw new ErrorEntity({ http_code: HttpStatus.EXPECTATION_FAILED, error: "invalid_request", error_description: "given provider is not supported, supported values : " + vals_allowed.join(",") });
        }
    }
}