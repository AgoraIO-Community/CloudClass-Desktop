import { t } from "@/i18n/index";


const ExceptionMapping = {
    "20410100": t('error.class_end'),
    "20403001": t('error.room_is_full')
}


export class BusinessExceptions {
    static getReadableText(errCode?: string):string {
        if(errCode && ExceptionMapping.hasOwnProperty(errCode)) {
            return ExceptionMapping[errCode]
        }
        return t('error.unknown')
    }
}