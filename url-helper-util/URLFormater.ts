import * as querystring from "querystring";
import * as url from "url";
const urljoin = require("url-join");
export class URLFormater {
    static addQueryStrings(targetUrl: string, obj: any) {
        let parsedPage = url.parse(targetUrl);
        let query: any = {

        };
        if (parsedPage.query) {
            query = querystring.parse(parsedPage.query);
        }
        for (let q of Object.keys(obj)) {
            query[q] = obj[q];
        }
        parsedPage.search = querystring.stringify(query);
        return url.format(parsedPage);
    }

    static addHash(targetUrl: string, obj: any) {
        return this.urljoin(targetUrl, "#" + querystring.stringify(obj));
    }

    static urljoin(...parts: string[]): string {
        return urljoin(...parts);
    }
}
