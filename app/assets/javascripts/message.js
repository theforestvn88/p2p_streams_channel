export const ConnectionState = {
    SessionJoin: "SessionJoin",
    SessionReady: "SessionReady",
    SdpOffer: "SdpOffer",
    SdpAnswer: "SdpAnswer",
    IceCandidate: "IceCandidate",
    Error: "Error",
    New: "new",
    Connecting: "connecting",
    Connected: "connected",
    DisConnected: "disconnected",
    Closed: "closed",
    Failed: "failed",
}


export const MessageType = {
    Connection: "Connection",
    Heartbeat: "Heartbeat",
    Data: "Data",
}