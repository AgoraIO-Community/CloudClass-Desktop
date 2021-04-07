import { transI18n } from 'agora-scenario-ui-kit';
import { GenericError } from 'agora-rte-sdk';

const ExceptionMapping = {
    "20410100": 'error.class_end',
    "20403001": 'error.room_is_full',
    "30429460": 'error.apply_co_video_limit',
    "30429461": 'error.send_co_video_limit',
}

export class BusinessExceptions {
    static getReadableText(errCode?: string): string {
        if(errCode && ExceptionMapping.hasOwnProperty(errCode)) {
            return ExceptionMapping[errCode]
        }
        return 'error.unknown'
    }

    static getErrorText(err: GenericError): string {
        const result = this.getReadableText(err.errCode)
        if (result === 'error.unknown') {
            return transI18n(result, {errCode: err.errCode, message: err.message})
        }
        return transI18n(result)
    }
}