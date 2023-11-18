import { ConnectionState } from "./connection_state"

const CONFIG = {
    iceServers: [
		{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
        },
	],
}

export default class P2pConnection {
    constructor(peer, peerId, hostId, config) {
        this.peer = peer
        this.peerId = peerId
        this.hostId = hostId
        this.config = config || CONFIG
    }

    setupRTCPeerConnection() {
        console.log("connection start ...")
        this.rtcPeerConnection = new RTCPeerConnection(this.config)
        this.rtcPeerConnection.onicecandidate = event => {
            console.log(`onicecandidate`)
            console.log(event)
            if (event.candidate) {
                let ice = {}
                ice[ConnectionState.IceCandidate] = event.candidate
                this.peer.signal(ConnectionState.IceCandidate, ice)
            }
        }
        this.rtcPeerConnection.oniceconnectionstatechange = event => {
            console.log(`oniceconnectionstatechange`)
            console.log(event)
        }

        this.rtcPeerConnection.onconnectionstatechange = (ev) => {
            console.log("onconnectionstatechange")
            console.log(ev)
            console.log(this.rtcPeerConnection.connectionState)
            this.peer.dispatchP2pConnectionState(this.peerId, this.rtcPeerConnection.connectionState, ev)
          }
        
        this.sendDataChannel = this.rtcPeerConnection.createDataChannel("sendChannel")
        this.sendDataChannel.onopen = this.handleSendChannelStatusChange.bind(this)
        this.sendDataChannel.onclose = this.handleSendChannelStatusChange.bind(this)

        this.rtcPeerConnection.ondatachannel = event => {
            console.log("ondatachannel p2p ...")
            this.receiveDataChannel = event.channel
            this.receiveDataChannel.onmessage = this.receiveP2pMessage.bind(this)
            this.receiveDataChannel.onopen = this.handleReceiveChannelStatusChange.bind(this)
            this.receiveDataChannel.onclose = this.handleReceiveChannelStatusChange.bind(this)

            this.sendDataChannel.send(`${this.peerId}: hi`)
        }

        return this.rtcPeerConnection
    }

    receiveP2pMessage(event) {
        console.log(`p2p received msg: ${event.data}`)
        this.peer.receivedP2pMessage(event.data)        
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
