import { reportService } from "@/services/report-service"

export const reportsMap = {
  'joining': (payload: any) => {
    reportService.initReportParams({
      appId: payload.appId,
      uid: payload.rtmUid,
      rid: payload.roomUuid,
      sid: payload.sessionId
    })
    reportService.reportEC('joinRoom', 'start')
  }
}