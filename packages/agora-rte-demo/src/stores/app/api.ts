import { t } from "@/i18n";
import { AppStore, UIStore } from "@/stores/app/index";
import { controller } from '@/edu-sdk/controller'
import { AgoraEduEvent } from '@/edu-sdk/declare'
import { BizLogger } from "@/utils/biz-logger";


type APICallback = (err?:Error, result?:any) => any

export class APIStore {


    appStore!: AppStore
    seqId: number = 0

    apiCallbacks: Map<number,  APICallback> = new Map<number, APICallback>()

    constructor(context: any) {
        this.appStore = context
    }


    callExternalAPI(name: string, params: any) {
        return new Promise((resolve, reject) => {
            let seqId = this.seqId++
            BizLogger.info(`[External API] API Call seq ${seqId} ${name}`)

            controller.appController.callback(
                AgoraEduEvent.apicall, {
                    name,
                    params,
                    seqId
                })
            this.apiCallbacks.set(seqId, (err?:Error, result?:any) => {
                if(err){
                    BizLogger.error(`[External API] API Call ${seqId} failed`)
                    return reject(err)
                }
                BizLogger.info(`[External API] API Call ${seqId} success`)
                resolve(result)
            })
        })
    }

    externalAPICallback(seqId: number, err?: Error, result?:any) {
        let callback = this.apiCallbacks.get(seqId)
        if(callback){
            this.apiCallbacks.delete(seqId)
            callback(err, result)
        } else {
            BizLogger.error(`[External API] No API with seq ${seqId} matched`)
        }
    }
}