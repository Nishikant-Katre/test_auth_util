import { EmailConfig } from "./EmailConfig";

export class CommonEmailSendEntity {
    to: string = "";
    from: string = "";
    from_name: string = "";
    subject: string = "";
    html: string = "";
    link_id: string = ""; // it may be session id, user id, verification id etc...
    sent_item_id: string = "";
    custom_arguments: any;
    attachments: any[] = [];

    email_config: EmailConfig | undefined = undefined;

    email_data: any;
}