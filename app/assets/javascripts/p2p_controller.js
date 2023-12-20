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

    p2pNegotiating() {
        console.log("p2pNegotiating ... ")
    }

    p2pConnecting() {
        console.log(`p2pConnecting ... ${[this.peerId, this.hostPeerId, this.iamHost]}`)
    }

    p2pConnected() {
        console.log(`p2pConnected ... ${[this.peerId, this.hostPeerId, this.iamHost]}`)
    }

    p2pDisconnected() {
        console.log(`p2pDisconnected ... ${[this.peerId, this.hostPeerId, this.iamHost]}`)
    }

    p2pClosed() {
        console.log(`p2pClosed ... ${[this.peerId, this.hostPeerId, this.iamHost]}`)
    }

    p2pError() {
        console.log(`p2pError ... ${[this.peerId, this.hostPeerId, this.iamHost]}`)
    }

    // send/received p2p message

    p2pSendMessage(message) {
        if (this.p2pFrame) {
            this.p2pFrame.sendP2pMessage(message)
        }
    }

    p2pReceivedMessage(message) {
    }
}
