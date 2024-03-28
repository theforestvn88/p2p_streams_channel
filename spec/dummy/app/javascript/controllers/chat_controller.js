import { P2pController } from "p2p"

export default class extends P2pController {
  static targets = ["message", "messagebox", "messages", "status"]

  p2pConnected() {
    console.log("CHAT CONNECTED .......................")
    this.messageboxTarget.classList.remove("not-available")
    this.messageboxTarget.classList.add("available")
  }

  send() {
    console.log("CHAT SEND MESSAGE")
    this.p2pSendMessage(this.messageTarget.value)
    this.messageTarget.value = ""
  }

  p2pReceivedMessage(message) {
    console.log(`CHAT RECEIVE ${message}`)
    switch(message["type"]) {
      case "Data":
        const chatLine = document.createElement("div")
        chatLine.innerText = `${message["senderId"]}: ${message["data"]}`
        this.messagesTarget.append(chatLine)
        break
      case "Data.Connection.State":
        console.log(`CHAT STATUS: `)
        console.log(message["data"])
        this.statusTarget.innerText = ""
        for (let [peer, state] of Object.entries(message["data"])) {
          const statusView = document.createElement("div")
          statusView.innerText = `${peer}: ${state}`
          this.statusTarget.append(statusView)
        }; 
        break
      default:
        break
    }
  }

  p2pDisconnected() {
    if (!this.iamHost) {
      this.statusTarget.innerText = "Stream disconnected! please refresh to continue"
    }
  }
}
