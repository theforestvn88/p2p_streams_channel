import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = [ "received" ]

    connect() {
        console.log("p2pController connected ...")
        this.p2pFrame = this.element.closest("p2p-frame")
        this.p2pFrame.setP2pListener(this)
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

    // send p2p message
    send(event) {
        // let sendView = event.target
        // let contentView = document.querySelector(sendView.getAttribute("content-view"))
        // let msg = JSON.stringify({
        //     msgType: contentView.getAttribute("msg-type") || "html-text",
        //     msgReceiver: sendView.getAttribute("msg-receiver"),
        //     msgContent: contentView.value
        // })
        // this.receive(msg)
        // this.p2pFrame.sendP2pMessage(msg)
    }

    // receive p2p message callback
    receiveP2pMessage(msg) {
        // console.log("p2pcontroller receive msg")
        // console.log(msg)
        // let receivedMsg = JSON.parse(msg)
        // let msgType = receivedMsg.msgType
        // switch(msgType) {
        //     case "html-text":
        //         let msgReceiverView = document.getElementById(receivedMsg.msgReceiver)
        //         msgReceiverView.insertAdjacentHTML("beforeend", `<p>${receivedMsg.msgContent}</p>`)
        //         break
        //     case "html-turbo":
        //         // Turbo.renderStreamMessage(html)
        //         break
        //     case "video":
        //         // 
        //         break
        // }
    }
}
