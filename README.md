# P2pStreamsChannel

Allow to setup one-to-many P2P stream connections ([WebRTC](https://webrtc.org/)) between clients through Rails server (ActionCable) as the signaling server. 

## Work Flow


```
===================================
Connect to Signaling Server (Rails)
===================================

host-user -------------------------------------> Rails server
host-user <-----views/chat_room----------------- Rails server
            (session: chat_room, peer_id: host_user)
host-user ---turbo-connect-stream--------------> Rails server/ActionCable

client-user -----------------------------------> Rails server
client-user <-----views/chat_room--------------- Rails server
        (session: chat_room, peer_id: client_user)
client-user ---turbo-connect-stream------------> Rails server/ActionCable

...
other clients
...


===========
Negotiation
===========

host-user ------SessionReady--> Rails Server --> client-user
client-user ----SessionReady--> Rails Server --> host-user
host-user --setupRTCPeerConnection --+
       <-----------------------------+  

host-user ------SdpOffer -----> Rails Server --> client-user
client-user --setupRTCPeerConnection --+
        <------------------------------+  

client-user ----SdpAnswer ----> Rails Server --> host-user

iceServers --ice-candidate----> host-user ----> client-user
iceServers --ice-candidate----> client-user --> host-user


=========
Connected
=========

After client-user connected to the host-user, all of them will disconnected to the signaling server (in order to save memory and other things), only the host-user keep connect to Rails server.
In case you want keep client connection, you could set params `keepCableConnection: true` to the p2p-frame.

client-user1 ----X disconnect from -----> Rails server Action cable
client-user2 ----X disconnect from -----> Rails server Action cable
...
host-user <-------keep connect to ------> Rails server Action cable

This is one-to-many p2p connections:
client-user1 --- send message 'hi' ---> host-user
host-user --- send message {user1: 'hi'} to --> others


============
Disconnected
============

client-user1 ---X disconnect ---> host-user
host-user ---> send client-user1 status ---> others

client-user1 ----reload --------> Rails server
host-user <--- start re-negotiating through Rails server ----> client-user1


host-user ---X disconnect ---> Rails server
all client-users will be disconnected
the first client-user re-connect to Rails server will become the new host
and start work-flow again

```

## Installation

```ruby
$ gem "p2p_streams_channel"
$ bundle isntall
$ rails g p2p_streams_channel:install
```

## Usage

Create a Stimulus P2pController in which you will receive other p2p-connections status, data send by other connected connections, and send your data to others.
```ruby
$ rails g p2p_streams_channel:controller chat
# it will create js file `app/javascript/controllers/chat_controller.js`
```

Render a p2p-frame-tag
```ruby
# views/chat_rooms/_chat_room.html.erb
<%= p2p_frame_tag(
    session_id: dom_id(chat_room), 
    peer_id: dom_id(current_user),
    # config: {
        # ice_servers: [
		#     { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
	    # ],
        # heartbeat: {
        #     interval_mls: 100,
        #     idle_timeout_mls: 200 
        # },
        # keepCableConnection: false
    # }
) do %>
    <div data-controller="chat">
        # chat room views
    </div>
<% end %>
```


Now you could implement your client side, 
for example: here is a simple chat controller:


```js
// app/javascript/controllers/chat_controller.js
import { P2pController } from "p2p"
export default class extends P2pController {
    //
    // p2p callbacks
    //
    p2pNegotiating() {
        // your peer start to negotiate with the host through ActionCable
        console.log("NEGOTIATING ...")
        this.showConnecting()
    }

    p2pConnecting() {
        // your peer is connecting directly with the host peer
        console.log("CONNECTING ...")
    }

    p2pConnected() {
        // your peer's connected to the host peer
        // from now you could start send message to the other through the host peer
        console.log("CONNECTED ...")
        this.hideConnecting()
        this.showChatBox()
    }

    p2pDisconnected() {
        // your peer's disconnected from the host peer
        this.showConnecting()
    }

    p2pClosed() {}

    p2pError() {}

    // receiving message from the other through the host peer
    p2pReceivedMessage(message) {
        switch(message["type"]) {
            case "Data":
                // message["data"]: the text message
                const chatLine = document.createElement("div")
                chatLine.innerText = `${message["senderId"]}: ${message["data"]}`
                this.chatBoxTarget.append(chatLine)
                break
            case "Data.Connection.State":
                // message["data"]: the current connection state of other peers
                for (let [peer, state] of Object.entries(message["data"])) {
                    this.updatePeerState(peer, state)
                }
                break
            default:
                break
        }
    }

    //
    // send message to the others through the host peer:
    // for example:
    // send-button in message box will trigger this action
    send() {
        this.p2pSendMessage(this.messageBoxTarget.value)
        this.messageBoxTarget.value = ""
    }

    // others:
    // this.iamHost: your peer is the host or not
    // this.peerId: your peer id
    // this.hostPeerId: the host peer id
    //
}
```

## Development

run test:
```ruby
$ cd spec/dummy
$ rails g p2p_streams_channel:install
$ cd ../..
$ rake spec
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/[USERNAME]/p2p_streams_channel.
