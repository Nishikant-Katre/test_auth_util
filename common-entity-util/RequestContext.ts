

import * as cookie from "cookie";
import { LocaleUtil } from "../locale-util/LocaleUtil";
import { RandomNumberGenerator } from "../random-id-generator-util/RandomNumberGenerator";
import { CloudFlareEntity } from "./CloudFlareEntity";

export class RequestContext {
    base_url: string;
    original_url: string;
    user_agent: string;
    referrer: string;
    x_request_id: string;
    tenant_key: string = "";
    accept_language: string;
    locale: string;
    headers: any;
    user: any;
    client_id: string = "";
    tenant_config: any;
    geo_location: GeoLocation | undefined;
    req: any;
    cn: string = "";
    device_ref_id: string = "";
    in_cookies: any;
    out_cookies: any[] = [];

    constructor(req: any, res: any) {
        const cdn_headers = this.resolveCDNHeaders(req);

        this.user_agent = req.headers['user-agent'];
        this.accept_language = req.headers['accept-language'];
        const locale = LocaleUtil.fromAcceptLanguage(req.headers['accept-language']);
        if (locale) {
            this.locale = locale.LocaleString.toLowerCase();
        } else {
            this.locale = 'en-us';
        }

        this.referrer = req.headers['referrer'];

        this.headers = req.headers;


        let protocol = req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] + "://" : "http://";
        if (cdn_headers && cdn_headers.protocol) {
            protocol = cdn_headers.protocol;
        }

        const hostname: string = req.headers['host'] || req.hostname;
        this.base_url = protocol + hostname;
        this.original_url = protocol + hostname + req.url;

        if (req.headers['x_request_id']) {
            this.x_request_id = req.headers['x_request_id'];
        } else {
            if (cdn_headers && cdn_headers.x_request_id) {
                this.x_request_id = cdn_headers.x_request_id;
            } else {
                this.x_request_id = Date.now().toString() + "-" + RandomNumberGenerator.getUniqueId();
            }
        }

        if (cdn_headers && cdn_headers.cn) {
            this.cn = cdn_headers.cn;
        }

        if (req.headers['cookie']) {
            this.in_cookies = cookie.parse(req.headers['cookie']);
            if (this.in_cookies['dr']) {
                this.device_ref_id = this.in_cookies['dr'];
            }
        }

        this.req = {};
        // const query = Object.create(null);
        // const url_data = new URL(this.original_url);
        // if (url_data.search) {
        //     const params = new URLSearchParams(url_data.search);

        //     params.forEach((val, key) => {
        //         if (query[key] === undefined) {
        //             query[key] = val;
        //         } else if (Array.isArray(query[key])) {
        //             query[key].push(val);
        //         } else {
        //             query[key] = [query[key], val];
        //         }
        //     });
        //     this.req.query = query;
        // }
        this.req.headers = this.headers;

    }

    private resolveCDNHeaders(req: any): CloudFlareEntity | undefined {
        const cloudFlareEntity = <CloudFlareEntity>{}
        if (req.headers["cdn-loop"] && req.headers["cdn-loop"] == "cloudflare") {
            try {
                const cf_visitor = JSON.parse(req.headers["cf-visitor"])
                if (cf_visitor && cf_visitor.scheme) {
                    cloudFlareEntity.protocol = cf_visitor.scheme + "://";
                }
                if (req.headers['cf-request-id']) {
                    cloudFlareEntity.x_request_id = req.headers['cf-request-id'];
                }
                if (req.headers["cf-ipcountry"]) {
                    cloudFlareEntity.cn = req.headers["cf-ipcountry"]
                }
            } catch (error) {

            }
            return cloudFlareEntity;
        }
        return undefined;
    }

    setTenantConfig(tenant_config: any) {
        this.tenant_config = tenant_config;
        this.tenant_key = tenant_config.tenant_key;
    }

    setUserContext(user: any) {
        this.user = user;
    }

    setGeoLocation(geo_location: GeoLocation) {
        this.geo_location = geo_location;
    }

    getContextLite(): RequestContext {
        const anyThis: any = this;
        const context_lite = <RequestContext>{};
        const object_keys = Object.keys(anyThis);
        for (const key of object_keys) {
            if (key == "req" || key == "res") {
                continue;
            }
            context_lite[key] = anyThis[key];
        }
        return context_lite;
    }

    getRequestCookies(): any {
        return this.in_cookies;
    }

    setResponseCookie(cookie: any): any {
        if (!this.out_cookies) {
            this.out_cookies = [];
        }
        this.out_cookies.push(cookie);
    }
    getResponseCookies(): any {
        return this.out_cookies;
    }

}

export class GeoLocation {
    lattitude: string = "";
    longitude: string = "";
}