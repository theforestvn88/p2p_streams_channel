import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    p2pSetup() {
        this.p2pFrame = this.element.closest("p2p-frame")
        if (this.p2pFrame) {
            this.p2pFrame.setP2pListener(this)
        } else {
            throw new Error("Couldn't find p2p-frame!")
        }
    }

    // p2p callbacks

    p2pConnecting() {
        console.log("p2pConnecting ... ")
    }

    p2pConnected(event) {
        console.log("p2pConnected ... ")
    }

    p2pDisconnected(event) {
        console.log("p2pDisconnected ... ")
    }

    p2pClosed(event) {
        console.log("p2pClosed ... ")
    }

    p2pError(event) {
        console.log("p2pError ... ")
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
