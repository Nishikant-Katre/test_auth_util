
import { HttpHelper } from "../../../http-helper-util/HttpHelper";
import { HttpStatus } from "../../../response-util/enums/HttpStatus";
import { ErrorEntity } from "../../../response-util/ErrorEntity";
import { URLFormater } from "../../../url-helper-util/URLFormater";
import { CommonSMSSendEntity } from "../../entity/CommonSMSSendEntity";
import { UnifonicConfig } from "./entity/UnifonicConfig";
import { UnifonicSMSContent, UnifonicSMSContentType, UnifonicSMSRecipient, UnifonicSMSRequest } from "./entity/UnifonicSMSRequest";
import { UnifonicSMSResponse } from "./entity/UnifonicSMSResponse";

export class UnifonicService {
    private static _instance: UnifonicService;

    static get Instance() {
        if (!this._instance) {
            this._instance = new UnifonicService();
        }
        return this._instance;
    }
    async sendSMS(commonEmailSendEntity: CommonSMSSendEntity) {
        try {
            if (!commonEmailSendEntity.sms_config) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `email config not found` });
            }
            if (!commonEmailSendEntity.sms_config.base_url) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `base_url not found for ${commonEmailSendEntity.sms_config.provider}` });
            }
            if (!commonEmailSendEntity.sms_config.client_id) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `client_id not found for ${commonEmailSendEntity.sms_config.provider}` });
            }
            if (!commonEmailSendEntity.sms_config.client_secret) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `client_secret not found for ${commonEmailSendEntity.sms_config.provider}` });
            }

            if (!commonEmailSendEntity.sms_config.meta_data) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `meta_data not found for ${commonEmailSendEntity.sms_config.provider}` });
            }

            if (!commonEmailSendEntity.sms_config.meta_data.default_channel) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `meta_data.default_channel not found for ${commonEmailSendEntity.sms_config.provider}` });
            }

            if (!commonEmailSendEntity.sms_config.meta_data.secondary_channel) {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "invalid_request", error_description: `meta_data.secondary_channel not found for ${commonEmailSendEntity.sms_config.provider}` });
            }

            const unifonicConfig = <UnifonicConfig>{};
            unifonicConfig.base_url = commonEmailSendEntity.sms_config.base_url;
            unifonicConfig.public_id = commonEmailSendEntity.sms_config.client_id;
            unifonicConfig.secret = commonEmailSendEntity.sms_config.client_secret;
            unifonicConfig.default_channel = commonEmailSendEntity.sms_config.meta_data.default_channel;
            unifonicConfig.secondary_channel = commonEmailSendEntity.sms_config.meta_data.secondary_channel;

            const url = URLFormater.urljoin(unifonicConfig.base_url, "/v1/messages");


            const payload = <UnifonicSMSRequest>{};

            payload.recipient = <UnifonicSMSRecipient>{};
            const default_channel: string = unifonicConfig.default_channel;
            payload.recipient.channel = default_channel;
            payload.recipient.contact = commonEmailSendEntity.to;

            payload.content = <UnifonicSMSContent>{};
            payload.content.type = UnifonicSMSContentType.text;
            payload.content.text = commonEmailSendEntity.message;

            const secondary_channel: string = unifonicConfig.secondary_channel;
            payload.fallback = <UnifonicSMSRecipient>{};
            payload.fallback.channel = secondary_channel;
            payload.fallback.contact = commonEmailSendEntity.to;

            const headers = new Map<string, string>();
            headers.set("PublicId", unifonicConfig.public_id);
            headers.set("Secret", unifonicConfig.secret);


            const smsResponse = await HttpHelper.postData(url, payload, headers);

            // sample success response 
            //{
            //     "message": "Message successfully queued.",
            //     "messageId": "343e43d7-80cf-4dee-9337-3ca3287b23bb",
            //     "applicationId": "bc674216-3df3-4cfa-97b1-ae4d0b5c31b6"
            // }

            if (smsResponse.statusCode == HttpStatus.OK) {
                const unifonicSMSResponse = <UnifonicSMSResponse>smsResponse.body;
                commonEmailSendEntity.sent_response = unifonicSMSResponse;
                commonEmailSendEntity.sent_item_id = unifonicSMSResponse.messageId;
            }


        } catch (error) {
            console.error(error);
        }
        return Promise.resolve(commonEmailSendEntity);

    }
}