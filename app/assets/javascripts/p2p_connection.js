import { MessageType } from "./message_type"

const CONFIG = {
    iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
	],
}

export default class P2pConnection {
    constructor(container, signaling, session, peerId) {
        this.container = container
        this.signaling = signaling
        this.session = session
        this.peerId = peerId
    }
    
    signal(key, val) {
        let msg = {
            "session": this.session,
            "peerId": this.peerId,
            "type": key
        }
        msg[key] = val
        console.log(msg)
        this.signaling.send(msg)
    }

    start() {
        this.connection = new RTCPeerConnection(CONFIG)
        this.connection.onicecandidate = event => {
            this.signal(MessageType.IceCandidate, event.candidate)
        }
        
        this.sendDataChannel = this.connection.createDataChannel("sendChannel");
        this.sendDataChannel.onopen = this.handleSendChannelStatusChange;
        this.sendDataChannel.onclose = this.handleSendChannelStatusChange;

        this.connection.ondatachannel = event => {
            this.receiveDataChannel = event.channel
            this.receiveDataChannel.onmessage = this.receiveP2pMessage
            this.receiveDataChannel.onopen = this.handleReceiveChannelStatusChange
            this.receiveDataChannel.onclose = this.handleReceiveChannelStatusChange
        }

        console.log("SEND MessageType.SessionJoin")
        this.signal(MessageType.SessionJoin, "")
    }

    handleConnectionMessage(data) {
        console.log(data)
        switch (data.type) {
            case MessageType.SessionJoin:
                break
            case MessageType.SessionReady:
                if (data.host == this.peerId) { // iam host
                    this.connection.createOffer()
                        .then(offer => {
                            return this.connection.setLocalDescription(offer)
                        })
                        .then(() => {
                            this.signal(MessageType.SdpOffer, JSON.stringify(this.connection.localDescription))
                        })
                        .catch(err => console.log(err))
                }

                break
            case MessageType.SdpOffer:
                if (data.host != this.peerId) { // iam not host
                    this.connection.setRemoteDescription(new RTCSessionDescription(data[MessageType.SdpOffer]))
                        .then(() => {
                            this.connection.createAnswer()
                                .then(answer => {
                                    return this.connection.setLocalDescription(answer)
                                })
                                .then(() => {
                                    this.signal(MessageType.SdpOffer, JSON.stringify(this.connection.localDescription))
                                })
                                .catch(err => console.log(err))
                        })
                }
                break
            case MessageType.SdpAnswer:
                if (data.host == this.peerId) { // iam host
                    this.connection.setRemoteDescription(new RTCSessionDescription(data[MessageType.SdpAnswer]))
                        .catch(err => console.log(err))
                }
                break
            case MessageType.IceCandidate:
                this.connection.addIceCandidate(new RTCIceCandidate(data[MessageType.IceCandidate]))
                    .catch(err => console.log(err))
                break
            case MessageType.Error:
                console.log(data)
                break
            default:
                break
        }
    }

    receiveP2pMessage(event) {
        this.container.dispatchP2pMessage(event.data)        
    }

    sendP2pMessage(message) {
        this.sendDataChannel.send(message)
    }

    handleSendChannelStatusChange(event) {

    }

    handleReceiveChannelStatusChange(event) {

    }
}
