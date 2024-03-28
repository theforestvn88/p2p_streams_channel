import { P2pController } from "p2p"

export default class extends P2pController {
    //
    // p2p callbacks
    //
    p2pNegotiating() {
        // your peer start to negotiate with the host through ActionCable
    }

    p2pConnecting() {
        // your peer is connecting directly with the host peer
    }

    p2pConnected() {
        // your peer's connected to the host peer
        // from now you could start send message to the other through the host peer
    }

    p2pDisconnected() {
        // your peer's disconnected from the host peer
    }

    p2pClosed() {}

    p2pError() {}

    // receiving message from the other through the host peer
    p2pReceivedMessage(message) {
        switch(message["type"]) {
            case "Data":
                // message["data"]: the raw text(or whatever)
                break
            case "Data.Connection.State":
                // message["data"]: the current connection state of other peers
                // for (let [peer, state] of Object.entries(message["data"])) {}
                break
            default:
                break
        }
    }

    //
    // send message to the others through the host peer:
    // this.p2pSendMessage('hi')
    //
    // this.iamHost: your peer is the host or not
    // this.peerId: your peer id
    // this.hostPeerId: the host peer id
    //
}
