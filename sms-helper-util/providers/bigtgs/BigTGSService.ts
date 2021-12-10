
import { HttpStatus } from "../../../response-util/enums/HttpStatus";
import { ErrorEntity } from "../../../response-util/ErrorEntity";
import { CommonSMSSendEntity } from "../../entity/CommonSMSSendEntity";

export class BigTGSService {
    private static _instance: BigTGSService;

    static get Instance() {
        if (!this._instance) {
            this._instance = new BigTGSService();
        }
        return this._instance;
    }
    async sendEmail(commonEmailSendEntity: CommonSMSSendEntity) {
        try {
            if (!commonEmailSendEntity.sms_config) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `email config not found` });
            }
            if (!commonEmailSendEntity.sms_config.client_secret) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `client_secret not found for ${commonEmailSendEntity.sms_config.provider}` });
            }

        } catch (error) {
            console.error(error);
        }
        return Promise.resolve(commonEmailSendEntity);

    }
}