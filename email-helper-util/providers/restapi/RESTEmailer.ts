


import { HttpHelper } from "../../../http-helper-util/HttpHelper";
import { HttpStatus } from "../../../response-util/enums/HttpStatus";
import { ErrorEntity } from "../../../response-util/ErrorEntity";
import { URLFormater } from "../../../url-helper-util/URLFormater";
import { CommonEmailSendEntity } from "../../entity/CommonEmailSendEntity";


export class RESTEmailer {
    private static _instance: RESTEmailer;

    static get Instance() {
        if (!this._instance) {
            this._instance = new RESTEmailer();
        }
        return this._instance;
    }

    async sendEmail(commonEmailSendEntity: CommonEmailSendEntity) {
        try {
            if (!commonEmailSendEntity.email_config) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `email config not found` });
            }
            if (!commonEmailSendEntity.email_config.host_name) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `host_name not found for ${commonEmailSendEntity.email_config.provider}` });
            }

            const email_rest_url = URLFormater.addQueryStrings(commonEmailSendEntity.email_config.host_name, { api_key: commonEmailSendEntity.email_config.client_secret })
            const headers = new Map<string, string>();
            headers.set("api_key", commonEmailSendEntity.email_config.client_secret);
            headers.set("api-key", commonEmailSendEntity.email_config.client_secret);
            HttpHelper.postData(email_rest_url, commonEmailSendEntity, headers).then(d => { console.log(d) }).catch(e => { console.error(e) });

        } catch (error) {
            console.error(error);
        }
        return Promise.resolve(commonEmailSendEntity);

    }
}