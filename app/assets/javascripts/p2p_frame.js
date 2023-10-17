import { Turbo, cable } from "@hotwired/turbo-rails"
import P2pConnection from "./p2p_connection"

class P2pFrameElement extends HTMLElement {
    // called each time the element is added to the document.
    async connectedCallback() {
      console.log("p2p-frame connected")
      Turbo.connectStreamSource(this);
      this.subscription = await cable.subscribeTo(this.channel, {
        received: this.receiveSignal.bind(this),
        connected: this.subscriptionConnected.bind(this),
        disconnected: this.subscriptionDisconnected.bind(this)
      }).catch(err => console.log(err));

      this.connection = new P2pConnection(this, this.subscription, this.session, this.peerId)
    }

    // called each time the element is removed from the document.
    disconnectedCallback() {
      console.log("p2p-frame disconnected")
      Turbo.disconnectStreamSource(this);
      if (this.subscription) this.subscription.unsubscribe()
    }

    subscriptionConnected() {
      console.log("subscriptionConnected")
      
      this.connection.start()
    }
  
    subscriptionDisconnected() {
      console.log("subscriptionDisconnected")
    }

    receiveSignal(message) {
      console.log("receive signal")
      console.log(message)
      this.connection.handleConnectionMessage(message)
    }

    setP2pListener(listener) { // listener is_a P2pController
      this.listeners ||= []
      this.listeners.push(listener)
    }

    dispatchP2pMessage(message) {
      // TODO: dispatch message to any nested controllers which implement handleP2pMessage
      // extends P2pController ?
      this.listeners.each(listener => {
        
      })
    }

    get channel() {
      const channel = this.getAttribute("channel")
      const signed_stream_name = this.getAttribute("signed-stream-name")
      return {
        channel: channel,
        signed_stream_name: signed_stream_name
      }
    }

    get session() {
      return this.getAttribute("session")
    }

    get peerId() {
      return this.getAttribute("peer-id")
    }

    get config() {
      return JSON.parse(this.getAttribute("config"))
    }
}

customElements.define("p2p-frame", P2pFrameElement)
