

import * as crypto from "crypto";
import { get, Options } from "request";
import { URLFormater } from "./../url-helper-util/URLFormater";
const base64url = require('base64-url');
var jose = require('node-jose');
var jwt = require('jsonwebtoken');

export class JWTHelper {

    private static _instance: JWTHelper;

    static get Instance() {
        if (!this._instance) {
            this._instance = new JWTHelper();
        }
        return this._instance;
    }


    getTokenHash(token: string): string {
        var keyByte = new Buffer(token, "ascii");
        const hash = crypto.createHash('sha256');
        hash.update(keyByte);
        let hash_get = hash.digest();
        var arr = hash_get.slice(0, 16);
        return base64url.encode(arr);
    }

    validateTokenHash(token: string, token_hash: string): boolean {
        if (token_hash == this.getTokenHash(token)) {
            return true;
        }
        return false;
    }



    private cached_jwks: Map<string, any> = new Map<string, any>();


    async getJWK(url: string, kid: string, chola_authkid: boolean = true) {
        return new Promise((resolve: (val: any | undefined) => void, reject) => {
            try {
                let cached_jwks = this.cached_jwks.get(kid);
                if (cached_jwks) {
                    let cached_time: Date = cached_jwks.cached_time;
                    let expire_time = new Date(cached_time.getTime() + (1000 * 60 * 20));

                    if (expire_time > new Date()) {
                        resolve(cached_jwks.key);
                        return;
                    }
                }
                var targetUrl = url;
                if (chola_authkid) {
                    targetUrl = URLFormater.urljoin(url, "?kid=" + kid)
                }
                let options: Options = {
                    url: targetUrl,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                get(options, (error, res, body) => {
                    if (error) {
                        console.log(error);
                        resolve(undefined);
                        return;
                    }
                    // console.log(body);
                    if (body) {
                        try {
                            var resolvedBody: any;
                            if (typeof body === 'string') {
                                resolvedBody = JSON.parse(body);
                            } else if (typeof body === 'object') {
                                resolvedBody = body;
                            }

                            if (!resolvedBody) {
                                throw new Error("invalid jwks response");
                            }

                            if (resolvedBody.keys) {
                                let resolvedKey: any = undefined;
                                let keys: any[] = resolvedBody.keys;
                                if (keys.length > 1) {
                                    let key = keys.find(c => {
                                        return c.kid == kid;
                                    });
                                    if (key) {
                                        resolvedKey = key;
                                    }
                                } else {
                                    resolvedKey = keys[0];
                                }
                                if (resolvedKey) {
                                    this.cached_jwks.set(kid, {
                                        key: resolvedKey,
                                        cached_time: new Date()
                                    });
                                }
                                resolve(resolvedKey);
                                return;
                            }

                        } catch (error) {
                            console.log(error);
                        }
                    }
                    resolve(undefined);
                });
            } catch (err) {
                console.log(err);
                resolve(undefined);
            }
        });
    }

    async getALG(token: string) {
        return new Promise((resolve: (val: string | undefined) => void, reject) => {
            try {
                let parts = token.split(".");
                if (parts.length > 0) {
                    let header = parts[0];
                    let buff = new Buffer(header, 'base64');
                    let headerJSON: any = JSON.parse(buff.toString('ascii'));
                    if (headerJSON.alg) {
                        resolve(headerJSON.alg);
                        return;
                    }
                }
                resolve(undefined);
            } catch (err) {
                console.log(err);
                resolve(undefined);
            }
        });
    }
    async getJWTKid(token: string) {
        return new Promise((resolve: (val: string | undefined) => void, reject) => {
            try {
                let parts = token.split(".");
                if (parts.length > 0) {
                    let header = parts[0];
                    let buff = new Buffer(header, 'base64');
                    let headerJSON: any = JSON.parse(buff.toString('ascii'));
                    if (headerJSON.kid) {
                        resolve(headerJSON.kid);
                        return;
                    }
                }
                resolve(undefined);
            } catch (err) {
                console.log(err);
                resolve(undefined);
            }
        });
    }

    async decryptJWT(token: string, publicKeyJWK: any, ignore_expiration: boolean = false) {
        return new Promise(async (resolve: (val: any) => void, reject) => {
            try {
                let publicKey: any;
                if (typeof publicKeyJWK == "string") {
                    if (publicKeyJWK.startsWith("--")) {
                        publicKey = await jose.JWK.asKey(publicKeyJWK, "pem");
                    } else {
                        publicKeyJWK = JSON.parse(publicKeyJWK);
                        delete publicKeyJWK.use;
                        publicKey = await jose.JWK.asKey(publicKeyJWK);
                    }
                } else if (typeof publicKeyJWK == "object") {
                    delete publicKeyJWK.use;
                    publicKey = await jose.JWK.asKey(publicKeyJWK);
                }
                let publicKeyPem = publicKey.toPEM();
                let option: any = {
                    algorithms: ['RS256']
                };
                if (ignore_expiration == true) {
                    option.ignoreExpiration = true;
                }
                const decoded = jwt.verify(token, publicKeyPem, option);
                resolve(decoded);

            } catch (error) {
                console.log(error);
                resolve(undefined);
            }
        });
    }

    async parseJWT(token: string, jwk_url: string, password: string = "", ignore_expiration: boolean = false) {
        return new Promise(async (resolve: (val: any) => void, reject) => {
            try {
                let alg = await this.getALG(token);

                if (alg) {
                    if (alg.startsWith("HS")) {
                        var decryptedClaims = jwt.verify(token, password, {
                            algorithms: ['HS256'],
                        });
                        resolve(decryptedClaims);
                    } else if (alg.startsWith("RS")) {
                        let kid = await this.getJWTKid(token);

                        if (kid) {
                            let jwk = await this.getJWK(jwk_url, kid);

                            if (jwk) {
                                let decryptedClaims = await this.decryptJWT(token, jwk, ignore_expiration);
                                if (decryptedClaims) {
                                    resolve(decryptedClaims);
                                    return;
                                }
                            }
                        }
                    }
                }
                resolve(undefined);
            } catch (error) {
                console.log(error);
                resolve(undefined);
            }
        });

    }

    simpleParseJWT(token: string): any {
        let tokenSplit = token.split(".");
        var buf = Buffer.from(tokenSplit[1], 'base64');
        let objct = JSON.parse(buf.toString());
        return objct;
    }
}