

import { HttpHelper } from "../../../http-helper-util/HttpHelper";
import { HttpStatus } from "../../../response-util/enums/HttpStatus";
import { ErrorEntity } from "../../../response-util/ErrorEntity";
import { URLFormater } from "../../../url-helper-util/URLFormater";
import { CommonSMSSendEntity } from "../../entity/CommonSMSSendEntity";


export class RESTSMSSender {
    private static _instance: RESTSMSSender;

    static get Instance() {
        if (!this._instance) {
            this._instance = new RESTSMSSender();
        }
        return this._instance;
    }

    async sendSMS(commonSMSSendEntity: CommonSMSSendEntity) {
        try {
            if (!commonSMSSendEntity.sms_config) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `sms config not found` });
            }
            if (!commonSMSSendEntity.sms_config.base_url) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `base_url not found for ${commonSMSSendEntity.sms_config.provider}` });
            }

            const email_rest_url = URLFormater.addQueryStrings(commonSMSSendEntity.sms_config.base_url, { api_key: commonSMSSendEntity.sms_config.client_secret })
            const headers = new Map<string, string>();
            headers.set("api_key", commonSMSSendEntity.sms_config.client_secret);
            headers.set("api-key", commonSMSSendEntity.sms_config.client_secret);
            HttpHelper.postData(email_rest_url, commonSMSSendEntity, headers).then(d => { console.log(d) }).catch(e => { console.error(e) });

        } catch (error) {
            console.error(error);
        }
        return Promise.resolve(commonSMSSendEntity);

    }
}