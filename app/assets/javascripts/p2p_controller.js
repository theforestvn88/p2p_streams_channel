import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
        this.p2pFrame = this.element.closest("p2p-frame")
    }

    send(event) {
        let sendElement = event.target
        let contentView = document.querySelector(sendElement.getAttribute("content-view"))
        this.p2pFrame.sendP2pMessage(contentView.value)
    }
}
