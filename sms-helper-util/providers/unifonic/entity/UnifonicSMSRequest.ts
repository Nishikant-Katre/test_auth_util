export interface UnifonicSMSRequest {
    recipient: UnifonicSMSRecipient;
    content: UnifonicSMSContent;
    fallback: UnifonicSMSRecipient;
}

export interface UnifonicSMSRecipient {
    contact: string;
    channel: string;
}
export interface UnifonicSMSContent {
    type: string;
    text: string;
}


export class UnifonicSMSContentType {
    static text = "text";
    static template = "template";
}