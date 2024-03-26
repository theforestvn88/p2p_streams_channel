import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
        this.p2pSetup()
    }

    p2pSetup() {
        this.p2pFrame = this.element.closest("p2p-frame")
        if (this.p2pFrame) {
            this.p2pFrame.setP2pListener(this)
        } else {
            throw new Error("Couldn't find p2p-frame!")
        }
    }

    get peerId() {
        this.p2pFrame.peer?.peerId
    }
    
    get hostPeerId() {
        this.p2pFrame.peer?.hostPeerId
    }

    get iamHost() {
        this.p2pFrame.peer?.iamHost
    }

    // p2p callbacks
    
    p2pNegotiating() {}

    p2pConnecting() {}

    p2pConnected() {}

    p2pDisconnected() {}

    p2pClosed() {}

    p2pError() {}

    // send/received p2p message

    p2pSendMessage(message) {
        if (this.p2pFrame) {
            this.p2pFrame.sendP2pMessage(message)
        }
    }

    p2pReceivedMessage(message) {}
}
