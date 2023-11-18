import { Turbo, cable } from "@hotwired/turbo-rails"
import P2pPeer from "./p2p_peer"

class P2pFrameElement extends HTMLElement {
    constructor() {
      super()
      this.listeners ||= []
    }

    // called each time the element is added to the document.
    async connectedCallback() {
      Turbo.connectStreamSource(this)
      this.subscription = await cable.subscribeTo(this.channel, {
        received: this.receiveSignal.bind(this),
        connected: this.subscriptionConnected.bind(this),
        disconnected: this.subscriptionDisconnected.bind(this)
      }).catch(err => console.log(err))

      this.peer = new P2pPeer(this.peerId, this, this.subscription, this.session, this.config)
    }

    // called each time the element is removed from the document.
    disconnectedCallback() {
      console.log("p2p-frame disconnected")
      Turbo.disconnectStreamSource(this);
      if (this.subscription) this.subscription.unsubscribe()
    }

    subscriptionConnected() {
      console.log("subscriptionConnected")
      this.peer.setup()
    }
  
    subscriptionDisconnected() {
      console.log("subscriptionDisconnected")
    }

    receiveSignal(message) {
      console.log("receive signal")
      console.log(message)
      this.peer.negotiate(message)
    }

    setP2pListener(listener) {
      this.listeners ||= []
      this.listeners.push(listener)
      console.log(this.listeners)
    }

    dispatchP2pMessage(message) {
      this.listeners.forEach(listener => {
        listener.receiveP2pMessage(message)
      })
    }

    sendP2pMessage(msg) {
      this.connection.sendP2pMessage(msg)
    }

    p2pConnecting() {
      this.listeners.forEach(listener => {
        listener.p2pConnecting()
      })
    }

    p2pConnected(ev) {
      console.log("p2pConnected")
      console.log(this.listeners)
      this.listeners.forEach(listener => {
        listener.p2pConnected(ev)
      })
    }

    p2pDisconnected(ev) {
      this.listeners.forEach(listener => {
        listener.p2pDisconnected(ev)
      })
    }

    p2pClosed(ev) {
      this.listeners.forEach(listener => {
        listener.p2pClosed(ev)
      })
    }

    p2pError(ev) {
      this.listeners.forEach(listener => {
        listener.p2pError(ev)
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

    get params() {
      return JSON.parse(this.getAttribute("params"))
    }

    get config() {
      return this.params["config"]
    }
}

customElements.define("p2p-frame", P2pFrameElement)
