import { del, get, Options, post, put } from "request";
import { CustomHttpResponse } from "./entity/CustomHttpResponse";

export class HttpHelper {
    static postData(url: string, data: any, headers: Map<string, any> | null = null, expect_json_response: boolean = true) {
        return new Promise((resolve: (val: CustomHttpResponse) => void, reject) => {
            let _headers: any = {
                "content-type": "application/json"
            }

            if (headers && headers.size > 0) {
                headers.forEach((v, k) => {
                    _headers[k] = v;
                });
            }

            let options: Options = {
                url: url,
                headers: _headers
            }
            options = this.prepareRequestOption(options, _headers, data);

            post(options, (error, response, body) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (expect_json_response && body) {
                    if (typeof body == "string") {
                        body = JSON.parse(body);
                    } else if (typeof body == "object") {
                        body = body;
                    }
                }

                let responseObj = {
                    statusCode: response.statusCode,
                    body: body
                }
                resolve(responseObj);
            });
        });

    }

    private static prepareRequestOption(options: Options, _headers: Map<string, any>, data: any): Options {
        if (data) {
            if (_headers['content-type'] == "application/x-www-form-urlencoded") {
                options.form = data;
            } else if (_headers['content-type'] == null) {
                options.formData = data
            } else if (_headers['content-type'] == "application/json") {
                options.json = data
            } else if (_headers['content-type'] == "text/plain"
                || _headers['content-type'] == "application/javascript"
                || _headers['content-type'] == "text/html"
                || _headers['content-type'] == "application/xml") {
                options.body = data
            } else {
                options.body = data
            }
        }
        return options;
    }


    static putData(url: string, data: any, headers: Map<string, any> | null = null, expect_json_response: boolean = true) {
        return new Promise((resolve: (val: CustomHttpResponse) => void, reject) => {
            let _headers: any = {
                "content-type": "application/json"
            }

            if (headers && headers.size > 0) {
                headers.forEach((v, k) => {
                    _headers[k.toLowerCase()] = v;
                });
            }

            let options: Options = {
                url: url,
                headers: _headers
            }
            options = this.prepareRequestOption(options, _headers, data);
            put(options, (error, response, body) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (expect_json_response && body) {
                    if (typeof body == "string") {
                        body = JSON.parse(body);
                    } else if (typeof body == "object") {
                        body = body;
                    }
                }

                let responseObj = {
                    statusCode: response.statusCode,
                    body: body
                }
                resolve(responseObj);
            });
        });

    }

    static getData(url: string, headers: Map<string, any> | null = null, expect_json_response: boolean = true) {
        return new Promise((resolve: (val: CustomHttpResponse) => void, reject) => {

            let _headers: any = {
                "content-type": "application/json"
            }

            if (headers && headers.size > 0) {
                headers.forEach((v, k) => {
                    _headers[k.toLowerCase()] = v;
                });
            }


            let options: Options = {
                url: url,
                headers: _headers
            }
            get(options, (error, response, body) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (expect_json_response && body) {
                    if (typeof body == "string") {
                        body = JSON.parse(body);
                    } else if (typeof body == "object") {
                        body = body;
                    }
                }

                let responseObj = {
                    statusCode: response.statusCode,
                    body: body
                }
                resolve(responseObj);
            });
        });

    }

    static deleteData(url: string, headers: Map<string, any> | null = null, expect_json_response: boolean = true) {
        return new Promise((resolve: (val: CustomHttpResponse) => void, reject) => {

            let _headers: any = {
                // "content-type": "application/json"
            }

            if (headers && headers.size > 0) {
                headers.forEach((v, k) => {
                    _headers[k.toLowerCase()] = v;
                });
            }


            let options: Options = {
                url: url,
                headers: _headers
            }
            del(options, (error, response, body) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (expect_json_response && body) {
                    if (typeof body == "string") {
                        body = JSON.parse(body);
                    } else if (typeof body == "object") {
                        body = body;
                    }
                }

                let responseObj = {
                    statusCode: response.statusCode,
                    body: body
                }
                resolve(responseObj);
            });
        });

    }
}