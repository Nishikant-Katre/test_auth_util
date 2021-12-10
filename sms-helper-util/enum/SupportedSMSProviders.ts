
import { HttpStatus } from "../../response-util/enums/HttpStatus";
import { ErrorEntity } from "../../response-util/ErrorEntity";

export class SupportedSMSProviders {
    static TWILIO = "TWILIO";
    static BIGTGS = "BIGTGS";
    static UNIFONIC = "UNIFONIC";
    static REST = "REST";
    static default(): string {
        return this.TWILIO;
    }
    static validate(val: string) {
        const vals_allowed = Object.values(SupportedSMSProviders);
        if (!vals_allowed.find(c => c.toLowerCase() == val.toLowerCase())) {
            throw new ErrorEntity({ http_code: HttpStatus.EXPECTATION_FAILED, error: "invalid_request", error_description: "given provider is not supported, supported values : " + vals_allowed.join(",") });
        }
    }
}