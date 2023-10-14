import { Turbo, cable } from "@hotwired/turbo-rails"
import P2pConnection from "./p2p_connection"

class P2pFrameElement extends HTMLElement {
    // called each time the element is added to the document.
    async connectedCallback() {
        Turbo.connectStreamSource(this);
        this.subscription = await cable.subscribeTo(this.channel, {
          received: this.receiveMessage.bind(this)
        });

        this.connection = new P2pConnection(this.subscription)
        this.connection.start()
    }

    // called each time the element is removed from the document.
    disconnectedCallback() {
        Turbo.disconnectStreamSource(this);
        if (this.subscription) this.subscription.unsubscribe()
    }

    receiveMessage(message) {
        this.connection.handle_connection_message(message)
    }

    get channel() {
        const channel = this.getAttribute("channel")
        const signed_stream_name = this.getAttribute("signed-stream-name")
        return {
          channel: channel,
          signed_stream_name: signed_stream_name
        }
      }
}

customElements.define("p2p-frame", P2pFrameElement)
