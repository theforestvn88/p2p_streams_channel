import { MessageType } from "./message_type"

const CONFIG = {
    iceServers: [
		{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
        },
	],
}

export default class P2pConnection {
    constructor(container, signaling, session, peerId, config) {
        console.log(`P2pConnection container ${container}`)
        this.container = container
        this.signaling = signaling
        this.session = session
        this.peerId = peerId
        this.config = config || CONFIG
    }
    
    signal(type, data) {
        let msg = {
            "session": this.session,
            "peer_id": this.peerId,
            "type": type,
            ...data
        }
        console.log(msg)
        this.signaling.send(msg)
    }

    start() {
        console.log("connection start ...")
        this.connection = new RTCPeerConnection(this.config)
        this.connection.onicecandidate = event => {
            console.log(`onicecandidate`)
            console.log(event)
            if (event.candidate) {
                let ice = {}
                ice[MessageType.IceCandidate] = event.candidate
                this.signal(MessageType.IceCandidate, ice)
            }
        }
        this.connection.oniceconnectionstatechange = event => {
            console.log(`oniceconnectionstatechange`)
            console.log(event)
        }

        this.connection.onconnectionstatechange = (ev) => {
            console.log("onconnectionstatechange")
            console.log(ev)
            console.log(this.connection.connectionState)
            switch (this.connection.connectionState) {
              // case "new":
              // case "connecting":
              //   this.p2pConnecting(ev)
              //   break;
              case "connected":
                this.container.p2pConnected(ev)
                break
              case "disconnected":
                this.container.p2pDisconnected(ev)
                break
              case "closed":
                this.container.p2pClosed(ev)
                break
              case "failed":
                this.container.p2pError(ev)
                break
              default:
                break
            }
          }
        
        this.sendDataChannel = this.connection.createDataChannel("sendChannel")
        this.sendDataChannel.onopen = this.handleSendChannelStatusChange.bind(this)
        this.sendDataChannel.onclose = this.handleSendChannelStatusChange.bind(this)

        this.connection.ondatachannel = event => {
            console.log("ondatachannel p2p ...")
            this.receiveDataChannel = event.channel
            this.receiveDataChannel.onmessage = this.receiveP2pMessage.bind(this)
            this.receiveDataChannel.onopen = this.handleReceiveChannelStatusChange.bind(this)
            this.receiveDataChannel.onclose = this.handleReceiveChannelStatusChange.bind(this)

            this.sendDataChannel.send(`${this.peerId}: hi`)
        }

        console.log("SEND MessageType.SessionJoin")
        this.signal(MessageType.SessionJoin, {})
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
                            let offer = {"host": data.host}
                            offer[MessageType.SdpOffer] = JSON.stringify(this.connection.localDescription)
                            this.signal(MessageType.SdpOffer, offer)
                        })
                        .catch(err => console.log(err))
                }

                break
            case MessageType.SdpOffer:
                if (data.host != this.peerId) { // iam not host
                    let offer = JSON.parse(data[MessageType.SdpOffer])
                    console.log(`${this.peerId} get Offer`)
                    console.log(offer)
                    this.connection.setRemoteDescription(new RTCSessionDescription(offer))
                        .then(() => {
                            this.connection.createAnswer()
                                .then(answer => {
                                    return this.connection.setLocalDescription(answer)
                                })
                                .then(() => {
                                    let answer = {"host": data.host}
                                    answer[MessageType.SdpAnswer] = JSON.stringify(this.connection.localDescription)
                                    this.signal(MessageType.SdpAnswer, answer)
                                })
                                .catch(err => console.log(err))
                        })
                }
                break
            case MessageType.SdpAnswer:
                if (data.host == this.peerId) { // iam host
                    let answer = JSON.parse(data[MessageType.SdpAnswer])
                    console.log(` ${this.peerId} get Answer`)
                    console.log(answer)
                    this.connection.setRemoteDescription(new RTCSessionDescription(answer))
                        .catch(err => console.log(err))
                }
                break
            case MessageType.IceCandidate:
                if (data[MessageType.IceCandidate]) {
                    this.connection.addIceCandidate(new RTCIceCandidate(data[MessageType.IceCandidate]))
                        .catch(err => console.log(err))
                }
                break
            case MessageType.Error:
                console.log(data)
                break
            default:
                break
        }
    }

    receiveP2pMessage(event) {
        console.log(`p2p received msg: ${event.data}`)
        this.container.dispatchP2pMessage(event.data)        
    }

    sendP2pMessage(message) {
        this.sendDataChannel.send(message)
    }

    handleSendChannelStatusChange(event) {
        console.log(event)
    }

    handleReceiveChannelStatusChange(event) {
        console.log(event)
    }
}
