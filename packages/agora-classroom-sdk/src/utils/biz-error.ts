import { GenericErrorWrapper } from 'agora-rte-sdk';
import { GenericError } from './../../../agora-rte-sdk/src/core/utils/generic-error';

const ExceptionMapping = {
    "20410100": 'error.class_end',
    "20403001": 'error.room_is_full',
    "30429460": 'error.apply_co_video_limit',
    "30429461": 'error.send_co_video_limit',
    // "30409460": 'error.conflict',
}

export class BusinessExceptions {
    static getReadableText(errCode?: string): string {
        if(errCode && ExceptionMapping.hasOwnProperty(errCode)) {
            return ExceptionMapping[errCode]
        }
        return 'error.unknown'
    }

    static getErrorInfo(err: GenericError): any {
        const result = this.getReadableText(err.errCode)
        if (result === 'error.unknown') {
            return [result, {errCode: err.errCode, message: err.message}]
        }
        return [result]
    }
}