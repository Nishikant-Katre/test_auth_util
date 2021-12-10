import {resolveMx} from 'dns'
import * as path from 'path'
import {Options, get} from 'request';
import { ConfigPathResolver } from '../../config-resolver-util/ConfigPathResolver';
import { ConfigResolver } from '../../config-resolver-util/ConfigResolver';
import { EmailConfig } from '../../email-helper-util/entity/EmailConfig';
import { SupportedEmailProviders } from '../../email-helper-util/enum/SupportedEmailProviders';
const client = require('@sendgrid/client')
const baseDomainPath = path.resolve(__dirname, '../../../resources/domains_list')

const pathForDisposableDomains = path.join(baseDomainPath, '/disposable_domains_list.json')
const localFileDomains = ConfigResolver.Instance.readContent(pathForDisposableDomains)
const pathForAllowedDomains = path.join(baseDomainPath, '/allowed_domains_list.json')
const allowedDomains = ConfigResolver.Instance.readContent(pathForAllowedDomains)

export class EmailValidationService{

    private static _instance: EmailValidationService

    static get Instance(){
        if(!this._instance){
            this._instance = new EmailValidationService();
        }
        return this._instance
    }
    async isValidEmailProvider(email_config: EmailConfig, email: string){
        return new Promise(async(resolve: (val: boolean)=> void, reject) =>{
            if(email_config.provider === SupportedEmailProviders.SENDGRID){
                client.setApiKey(email_config.client_secret)
                const data = {
                    "email": email,
                    "source": "signup"
                }
                const request = {
                    url: `/v3/validations/email`,
                    method: 'POST',
                    body: data
                }
                client.request(request)
                    .then(([response, body])=>{
                        console.log('body', response.body);
                        console.log('status', response.status);
                        resolve(true)
                        return
                    }).catch(err =>{
                        console.log('err', err);
                        resolve(false)
                        return
                    })
            }
            else{
                var domain = ""
                if(email.indexOf('@') >=0){
                    domain = email.split('@')[1]
                }else{
                    domain = email
                }
                domain = domain.toLowerCase();
                let hasMxRecord = await this.domainHasMxRecord(domain);
                if(!hasMxRecord){
                    resolve(false)
                    return 
                }
                if(JSON.parse(allowedDomains).find(x => x === domain)){
                    resolve(true)
                    return
                }
                let isDisposable = await this.isDisposableEmail(domain)
                resolve(!isDisposable)
            }

        });
    }

    private async domainHasMxRecord(domain: string){
        return new Promise(async(resolve: (val: boolean)=> void, reject) =>{
            resolveMx(domain, (err, addresses)=>{
                if(addresses && addresses.length > 0){
                    resolve(true)
                }else resolve(false)
            })
        });
    }
    private disposableCache: Map<string, boolean> = new Map<string, boolean>();
    private async isDisposableEmail(domain: string){
        return new Promise(async(resolve:(val:boolean) => void, reject)=>{
            
            if(this.disposableCache.size == 0){
                let disposableDomainList = await this.getDisposableDomainsLocalList();
                
                for (let val of disposableDomainList) {
                    this.disposableCache.set(val.toLowerCase(), true)                    
                }
            }
        
            if(this.disposableCache.size == 0 || !this.disposableCache.has(domain.toLowerCase())){
                resolve(false)
            }else{
                resolve(true)
            }

        })
    }
    private async getDisposableDomainsLocalList(){  
        return new Promise(async(resolve:(val: string[]) => void, reject)=>{
               if(localFileDomains){
                let body = JSON.parse(localFileDomains)
                
                if(body){
                  let result = <string[]>body
                  resolve(result); 
                }
               } 
               else{
                   resolve([])
               }
        })
    }
    private async getDisposableDomains(){
        return new Promise(async(resolve: (val: string[])=> void, reject)=>{
            let options:Options = {
                url: 'https://raw.githubusercontent.com/andreis/disposable-email-domains/master/domains.json',
                headers:{
                    'Content-Type': 'application/Json'
                }
            }
            get(options, (error, res, body)=>{
                if(error){
                    resolve([])
                    return
                }

                if(body && typeof body === 'string'){
                    try{
                        body = JSON.parse(body)
                    }catch(error){
                        console.log(error);
                    }
                }
                if(body){
                    let result = <string[]>body;
                    resolve(result)
                }else{
                    resolve([])
                }
            })
        })
    }
}