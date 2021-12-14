class GlobalConfigs {
    sdkDomain: string = 'https://api.agora.io'
    // sdkDomain: string = 'https://api-solutions-dev.bj2.agoralab.co'
    reportDomain: string = 'https://api.agora.io'
    // reportDomain: string = 'https://api-solutions-dev.bj2.agoralab.co'
    logDomain: string = 'https://api-solutions.agoralab.co'
    // logDomain: string = 'https://api-solutions-dev.bj2.agoralab.co'
    appId: string = ''
}

let globalConfigs = new GlobalConfigs()

export {globalConfigs}