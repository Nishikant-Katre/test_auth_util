
import { HttpStatus } from "../../../response-util/enums/HttpStatus";
import { ErrorEntity } from "../../../response-util/ErrorEntity";
import * as nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/smtp-transport";
import { CommonEmailSendEntity } from "../../entity/CommonEmailSendEntity";


export class SMTPEmailer {
    private static _instance: SMTPEmailer;

    static get Instance() {
        if (!this._instance) {
            this._instance = new SMTPEmailer();
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

            var options: any = {
                host: commonEmailSendEntity.email_config.host_name,
                // secure: true
                requireTLS: true
            };

            if (commonEmailSendEntity.email_config.host_port) {
                options.port = commonEmailSendEntity.email_config.host_port;
            }

            if (commonEmailSendEntity.email_config.client_id || commonEmailSendEntity.email_config.client_secret) {
                options.auth = {};
                if (commonEmailSendEntity.email_config.client_id) {
                    options.auth.user = commonEmailSendEntity.email_config.client_id;
                }
                if (commonEmailSendEntity.email_config.client_secret) {
                    options.auth.pass = commonEmailSendEntity.email_config.client_secret;
                }
            }

            const transporter = nodemailer.createTransport(options);

            let from_email = commonEmailSendEntity.email_config.from;
            if (commonEmailSendEntity.from) {
                from_email = commonEmailSendEntity.from;
            }

            if (commonEmailSendEntity.from_name) {
                from_email = commonEmailSendEntity.from_name + " <" + from_email + ">";
            }

            var mailOptions: Options = {
                from: from_email,
                to: commonEmailSendEntity.to,
                subject: commonEmailSendEntity.subject,
                html: commonEmailSendEntity.html
            };


            if (commonEmailSendEntity.attachments) {
                mailOptions.attachments = commonEmailSendEntity.attachments;
            }


            transporter.sendMail(mailOptions)
                .then(emailResponse => {
                    if (emailResponse && emailResponse.messageId) {
                        console.log(emailResponse, "Email Response");
                    } else {
                        if (emailResponse) {
                            console.debug(emailResponse, "SMTP error response");
                        } else {
                            console.debug("Empty SMTP response");
                        }
                    }
                }).catch(e => {
                    console.error(e, "SMTP error response");
                });


        } catch (error) {
            console.error(error);
        }
        return Promise.resolve(commonEmailSendEntity);

    }
}