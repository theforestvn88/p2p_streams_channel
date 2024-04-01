import { ConnectionState, MessageType } from "p2p/message"

const ICE_CONFIG = {
    iceServers: [
		{ 
            urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
        },
	],
}

export default class P2pConnection {
    constructor(peer, clientId, hostId, iamHost, iceConfig, heartbeatConfig) { // TODO: add heartbeatInterval to config
        this.peer = peer
        this.clientId = clientId
        this.hostId = hostId
        this.iamHost = iamHost
        this.state = ConnectionState.New
        this.lastTimeUpdate = 0
        this.iceConfig = iceConfig || ICE_CONFIG
        this.heartbeatConfig = heartbeatConfig
    }

    setupRTCPeerConnection() {
        // console.log("connection start ...")
        this.rtcPeerConnection = new RTCPeerConnection(this.iceConfig)

        this.rtcPeerConnection.onicecandidate = event => {
            // console.log(event)
            if (event.candidate) {
                let ice = {}
                ice[ConnectionState.IceCandidate] = event.candidate
                this.peer.signal(ConnectionState.IceCandidate, ice)
            }
        }
        this.rtcPeerConnection.oniceconnectionstatechange = event => {
            // console.log(event)
        }

        this.rtcPeerConnection.onconnectionstatechange = (ev) => {
            // console.log(`onconnectionstatechange ${this.rtcPeerConnection.connectionState}`)
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
            // console.log("ondatachannel p2p ...")
            this.receiveDataChannel = event.channel
            this.receiveDataChannel.onmessage = this.receiveP2pMessage.bind(this)
            this.receiveDataChannel.onopen = this.handleReceiveChannelStatusChange.bind(this)
            this.receiveDataChannel.onclose = this.handleReceiveChannelStatusChange.bind(this)
            
            this.peer.updateP2pConnectionState(this)
        }

        return this.rtcPeerConnection
    }

    receiveP2pMessage(event) {
        // console.log(`p2p received msg: ${event.data}`)
        const msg = JSON.parse(event.data)
        switch (msg.type) {
            case MessageType.Heartbeat:
                this.state = ConnectionState.Connected
                this.lastTimeUpdate = Date.now()
                break
            default:
                this.peer.receivedP2pMessage(msg)
                break
        }
    }

    sendP2pMessage(message, type = MessageType.Data, senderId = null) {
        if (this.sendDataChannel && this.sendDataChannelOpen) {
            const msgJson = JSON.stringify({
                type: type,
                senderId: senderId || this.peer.peerId,
                data: message
            })
            this.sendDataChannel.send(msgJson)
        } else {
            // console.warn("the send data channel is not available!")
        }
    }

    handleSendChannelStatusChange(event) {
        // console.log(event)
        if (this.sendDataChannel) {
            this.sendDataChannelOpen = this.sendDataChannel.readyState == "open"
            if (this.sendDataChannelOpen && this.heartbeatConfig) {
                this.scheduleHeartbeat()
            }
        }
    }

    handleReceiveChannelStatusChange(event) {
        // console.log(event)
    }

    scheduleHeartbeat() {
        this.heartbeat = setTimeout(() => {
            this.sendHeartbeat()
        }, this.heartbeatConfig.interval_mls)
    }

    sendHeartbeat() {
        if (this.lastTimeUpdate > 0 && Date.now() - this.lastTimeUpdate > this.heartbeatConfig.idle_timeout_mls) {
            // console.log("HEART-BEAT DETECT DISCONNECTED ............")
            this.state = ConnectionState.DisConnected
            this.peer.updateP2pConnectionState(this)
        } else {
            this.sendP2pMessage("ping", MessageType.Heartbeat)
            this.scheduleHeartbeat()
        }
    }

    stopHeartbeat() {
        // console.log(`stop heartbeat ${this.hostId} <-> ${this.clientId}`)
        clearTimeout(this.heartbeat)
    }
    
    close() {
        // console.log(`close the connection ${this.hostId} <-> ${this.clientId}`)
        this.stopHeartbeat()
    }
}
