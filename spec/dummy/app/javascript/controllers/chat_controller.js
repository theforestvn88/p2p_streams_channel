import { P2pController } from "p2p"

export default class extends P2pController {
  static targets = ["message", "messagebox", "room"]

  p2pConnected() {
    console.log("CHAT CONNECTED .......................")
    this.messageboxTarget.classList.remove("not-available")
    this.messageboxTarget.classList.add("available")
  }

  send() {
    console.log("CHAT SEND MESSAGE")
    this.p2pSendMessage(this.messageTarget.value)
  }

  p2pReceivedMessage(message) {
    console.log(`CHAT RECEIVE ${message}`)
    switch(message["type"]) {
      case "Data":
        const chatLine = document.createElement("div")
        chatLine.innerText = message["data"]
        this.roomTarget.append(chatLine)
        break
      default:
        break
    }
  }
}
