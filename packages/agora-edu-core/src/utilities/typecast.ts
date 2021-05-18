import { EduRoleType, EduRoleTypeEnum, EduSceneType } from "agora-rte-sdk";

export const EduUserRoleEnum2EduUserRole = (from: EduRoleTypeEnum, scene: EduSceneType):EduRoleType => {
    switch(from) {
        case EduRoleTypeEnum.teacher:
            return EduRoleType.teacher
        case EduRoleTypeEnum.student:
            return scene === EduSceneType.Scene1v1 ? EduRoleType.student : EduRoleType.audience
        case EduRoleTypeEnum.assistant:
            return EduRoleType.assistant
        case EduRoleTypeEnum.invisible:
            return EduRoleType.invisible
    }
    console.error(`[Type Cast] Type cast failed: ${from} ${scene}`)
    return EduRoleType.none
}