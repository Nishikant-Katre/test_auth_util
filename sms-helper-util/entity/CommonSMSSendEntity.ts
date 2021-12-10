import { SMSConfig } from "./SMSConfig";

export class CommonSMSSendEntity {
    to: string = "";
    from: string = "";
    from_name: string = "";
    message: string = "";

    link_id: string = ""; // it may be session id, user id, verification id etc...
    sent_item_id: string = "";

    sent_response: any;

    sms_config: SMSConfig | undefined = undefined;
}