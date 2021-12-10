
const sendgrid = require("@sendgrid/mail");
import { HttpStatus } from "../../../response-util/enums/HttpStatus";
import { ErrorEntity } from "../../../response-util/ErrorEntity";
import { CommonEmailSendEntity } from "../../entity/CommonEmailSendEntity";

export class SendGridEmailer {
    private static _instance: SendGridEmailer;

    static get Instance() {
        if (!this._instance) {
            this._instance = new SendGridEmailer();
        }
        return this._instance;
    }
    async sendEmail(commonEmailSendEntity: CommonEmailSendEntity) {
        try {
            if (!commonEmailSendEntity.email_config) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `email config not found` });
            }
            if (!commonEmailSendEntity.email_config.client_secret) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `client_secret not found for ${commonEmailSendEntity.email_config.provider}` });
            }

            const message: any = {
                to: commonEmailSendEntity.to,
                from: commonEmailSendEntity.from,
                subject: commonEmailSendEntity.subject,
                html: commonEmailSendEntity.html
            }
            message.customArgs = {};
            if (commonEmailSendEntity.sent_item_id) {
                message.customArgs.sent_item_id = commonEmailSendEntity.sent_item_id;
            }
            if (commonEmailSendEntity.link_id) {
                message.customArgs.link_id = commonEmailSendEntity.link_id;
            }
            if (commonEmailSendEntity.custom_arguments) {
                for (const custom_argument_key of Object.keys(commonEmailSendEntity.custom_arguments)) {
                    message.customArgs[custom_argument_key] = commonEmailSendEntity.custom_arguments[custom_argument_key]
                }
            }
            if (commonEmailSendEntity.attachments && commonEmailSendEntity.attachments.length > 0) {
                message.attachments = commonEmailSendEntity.attachments;
            }
            sendgrid.setApiKey(commonEmailSendEntity.email_config.client_secret);
            sendgrid.send(message).then(d => { console.log(d); }).catch(e => { console.error(e); });
        } catch (error) {
            console.error(error);
        }
        return Promise.resolve(commonEmailSendEntity);

    }
}