const dns = require('dns');
export class DomainValidator {
    static validateTxt(domain_name: string, txt_value: string) {
        return new Promise(async (resolve: (val: boolean) => void, reject) => {
            const host = this.getHost(domain_name)
            if (!host) {
                resolve(false);
                return;
            }
            dns.resolveTxt(host, (err, result) => {
                if (err) {
                    console.log("err", err)
                    resolve(false);
                    return;
                }

                if (!result) {
                    resolve(false);
                    return;
                }

                let is_match_found = false;
                for (const rec of result) {
                    for (const _rec of rec) {
                        if (txt_value == _rec) {
                            is_match_found = true;
                            break;
                        }
                    }
                    if (is_match_found) {
                        break;
                    }
                }

                resolve(is_match_found);
                return;

            })
        })
    }


    static getHost(domain_name: string): string {
        try {
            const url_obj = new URL(domain_name);
            return url_obj.host;

        } catch (error) {

        }
        return "";
    }

    static isValidURL(domain_name: string): boolean {
        try {
            if (this.getHost(domain_name)) {
                return true;
            }
        } catch (error) {

        }
        return false;
    }

}
