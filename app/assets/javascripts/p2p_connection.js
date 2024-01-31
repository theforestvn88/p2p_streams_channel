import { ConnectionState, MessageType } from "./message"

const CONFIG = {
    iceServers: [
		{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
        },
	],
}

export default class P2pConnection {
    constructor(peer, clientId, hostId, iamHost, config) { // TODO: add heartbeatInterval to config
        this.peer = peer
        this.clientId = clientId
        this.hostId = hostId
        this.iamHost = iamHost
        this.state = ConnectionState.New
        this.lastTimeUpdate = Date.now()
        this.config = config || CONFIG
        this.heartbeat = null
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
            this.state = this.rtcPeerConnection.connectionState
            if (this.state == ConnectionState.DisConnected || this.state == ConnectionState.Closed) {
                this.close()
            }
            this.peer.updateP2pConnectionState(this)
          }
        
        this.sendDataChannel = this.rtcPeerConnection.createDataChannel("sendChannel")
        this.sendDataChannelOpen = false
        this.sendDataChannel.onopen = this.handleSendChannelStatusChange.bind(this)
        this.sendDataChannel.onclose = this.handleSendChannelStatusChange.bind(this)

        this.rtcPeerConnection.ondatachannel = event => {
            console.log("ondatachannel p2p ...")
            this.receiveDataChannel = event.channel
            this.receiveDataChannel.onmessage = this.receiveP2pMessage.bind(this)
            this.receiveDataChannel.onopen = this.handleReceiveChannelStatusChange.bind(this)
            this.receiveDataChannel.onclose = this.handleReceiveChannelStatusChange.bind(this)
        }

        return this.rtcPeerConnection
    }

    receiveP2pMessage(event) {
        console.log(`p2p received msg: ${event.data}`)
        this.peer.receivedP2pMessage(event.data)        
    }

    sendP2pMessage(message, type = MessageType.Data, senderId = null) {
        if (this.sendDataChannel && this.sendDataChannelOpen) {
            const msgJson = JSON.stringify({
                type: type,
                senderclientId: senderId || this.peer.peerId,
                data: message
            })
            this.sendDataChannel.send(msgJson)
        } else {
            console.warn("the send data channel is not available!")
        }
    }

    handleSendChannelStatusChange(event) {
        console.log(event)
        if (this.sendDataChannel) {
            this.sendDataChannelOpen = this.sendDataChannel.readyState == "open"
            if (this.sendDataChannelOpen) {
                this.scheduleHeartbeat()
            } else {
                this.stopHeartbeat()
            }
        }
    }

    handleReceiveChannelStatusChange(event) {
        console.log(event)
    }

    scheduleHeartbeat() {
        this.heartbeat = setTimeout(() => {
            this.sendHeartbeat()
        }, 5000)
    }

    sendHeartbeat() {
        this.sendP2pMessage("ping", MessageType.Heartbeat)
        this.scheduleHeartbeat()
    }

    stopHeartbeat() {
        console.log(`stop heartbeat ${this.hostId} <-> ${this.clientId}`)
        clearTimeout(this.heartbeat)
    }
    
    close() {
        console.log(`close the connection ${this.hostId} <-> ${this.clientId}`)
        this.stopHeartbeat()
    }
}
