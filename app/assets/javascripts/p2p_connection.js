export default class P2pConnection {
    constructor(signaling) {
        this.signaling = signaling
    }

    start() {
        // this.signaling.send(SessionJoin)     
    }

    handle_connection_message(message) {
        //      SessionJoin
        //      SessionReady
        //      SdpOffer
        //      SdpAnswer
        //      IceCandidate
        //      Error
    }
}
