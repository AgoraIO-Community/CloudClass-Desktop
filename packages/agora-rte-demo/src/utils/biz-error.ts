import { t } from "@/i18n";
import { GenericError } from "agora-rte-sdk";

const ExceptionMapping = {
    "20410100": t('error.class_end'),
    "20403001": t('error.room_is_full')
}


export class BusinessExceptions {
    static getReadableText(errCode?: string, errMessage?: string):string {
        if(errCode && ExceptionMapping.hasOwnProperty(errCode)) {
            return ExceptionMapping[errCode]
        }
        let details = []
        if(errCode){
            details.push(`${errCode}`)
        }
        if(errMessage) {
            details.push(`${errMessage}`)
        }
        return `${t('error.unknown')}: ${details.join(': ')}`
    }
}