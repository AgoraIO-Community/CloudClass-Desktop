import { t } from "@/i18n";

const ExceptionMapping = {
    "20410100": t('error.class_end')
}


export class BusinessExceptions {
    static getReadableText(errCode?: string):string {
        if(errCode && ExceptionMapping.hasOwnProperty(errCode)) {
            return ExceptionMapping[errCode]
        }
        return t('error.unknown')
    }
}