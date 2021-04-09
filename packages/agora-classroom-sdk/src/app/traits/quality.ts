export interface QualityDiagnosticsInterface {
  networkLevel: number,
  localPacketLost: number,
  remoteDiagnostics: {
    networkLevel: number,
    localPacketLost: number,
    uid: number,
    videoStats: any,
    audioStats: any,
  }
}