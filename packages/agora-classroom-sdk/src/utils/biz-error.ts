
const ExceptionMapping = {
    "20410100": 'error.class_end',
    "20403001": 'error.room_is_full',
    "30429460": 'error.apply_co_video_limit',
    "30429461": 'error.send_co_video_limit',
}

export class BusinessExceptions {
    static getReadableText(errCode?: string):string {
        if(errCode && ExceptionMapping.hasOwnProperty(errCode)) {
            return ExceptionMapping[errCode]
        }
        return 'error.unknown'
    }
}