import { resolveMx } from "dns";
import { get, Options } from "request";
import { SMSConfig } from "../../sms-helper-util/entity/SMSConfig";
import { PhoneEntity } from "./entity/PhoneEntity";
import { ModeOptions } from "./enum/ModeOptions";
import { TypeProvider } from "./enum/TypeProvider";
var twilio = require("twilio");
var libphonenumber = require("libphonenumber-js");

export class MobileValidatorService {

    private static _instance: MobileValidatorService;

    static get Instance() {
        if (!this._instance) {
            this._instance = new MobileValidatorService();
        }
        return this._instance;
    }

    async isValidMobile(mobile: string, mobile_config: SMSConfig, mode: string = "") {
        return new Promise(async (resolve: (val?: PhoneEntity | undefined) => void, reject) => {

            try {
                let typeOptions = ""
                if(mode.toUpperCase() == ModeOptions.CARRIER){
                    typeOptions = TypeProvider.CARRIER
                }else if(mode.toUpperCase() === ModeOptions.CALLER){
                    typeOptions = TypeProvider.CALLER
                }
                if (!mobile.startsWith("+")) {
                    console.log("Mobile must start with +");
                    resolve(undefined);
                    return;
                }

                let client = new twilio(mobile_config.client_id, mobile_config.client_secret);
                client.lookups.v1
                    .phoneNumbers(mobile)
                    .fetch()
                    .then((number) => {
                        //console.log(number);
                        let phone = new PhoneEntity();
                        if (number.carrier) {
                            if (number.carrier) {
                                phone.carrier_name = number.carrier.name;
                            }
                            if (number.carrier.type) {
                                phone.carrier_type = number.carrier.type;
                            }
                        }
                        phone.country = number.countryCode;
                        phone.given_phone = mobile;
                        phone.national_format = number.nationalFormat;


                        var number = libphonenumber.parse(mobile);
                        phone.phone = number.phone;

                        var code = libphonenumber.getCountryCallingCode(number.country);
                        phone.dial_code = code;

                        var internationalNumber = libphonenumber.format(number.phone, number.country, "International");
                        phone.international_format = internationalNumber;

                        var internationalNumber = libphonenumber.format(number.phone, number.country, "E.164");
                        phone.E164_format = internationalNumber;

                        // var national_format = libphonenumber.format(number.phone, number.country, "National");
                        // phone.national_format = national_format;

                        resolve(phone);
                    }, (err) => {
                        //console.log(err);
                        resolve(undefined);
                    });
            } catch (error) {
                console.log(error);
                resolve(undefined);
            }

        });
    }

    static async parsePhoneLocal(mobile: string, countryCode: string) {
        return new Promise(async (resolve: (val?: PhoneEntity | undefined) => void, reject) => {

            try {
                let phone = new PhoneEntity();
                var number: any;
                if (countryCode) {
                    number = libphonenumber.parse(mobile, countryCode);
                } else {
                    number = libphonenumber.parse(mobile);
                }
                phone.country = number.country;
                phone.given_phone = mobile;
                phone.phone = number.phone;

                var code = libphonenumber.getCountryCallingCode(number.country);
                phone.dial_code = code;

                var internationalNumber = libphonenumber.format(number.phone, number.country, "International");
                phone.international_format = internationalNumber;

                var internationalNumber = libphonenumber.format(number.phone, number.country, "E.164");
                phone.E164_format = internationalNumber;

                var national_format = libphonenumber.format(number.phone, number.country, "National");
                phone.national_format = national_format;

                resolve(phone);
            } catch (error) {
                console.log(error);
                resolve(undefined);
            }

        });
    }


}
