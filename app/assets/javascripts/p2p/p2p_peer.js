import { ConnectionState, MessageType } from "p2p/message"
import P2pConnection from "p2p/p2p_connection"

export default class P2pPeer {
    constructor(sessionId, peerId, container, signaling, iceConfig, heartbeatConfig) {
        this.sessionId = sessionId
        this.container = container
        this.signaling = signaling
        this.iceConfig = iceConfig
        this.heartbeatConfig = heartbeatConfig
        this.peerId = peerId
        this.hostPeerId = null
        this.iamHost = false
        this.state = null
    }

    setup() {
        this.connections = new Map()
        this.signal(ConnectionState.SessionJoin, {})
        this.dispatchP2pConnectionState({state: ConnectionState.Negotiating})
    }

    signal(state, data) {
        let msg = {
            "type": MessageType.Connection,
            "session_id": this.sessionId,
            "peer_id": this.peerId,
            "state": state,
            ...data
        }
        this.signaling.send(msg)
    }

    negotiate(msg) {
        switch (msg.state) {
            case ConnectionState.SessionJoin:
                break
            case ConnectionState.SessionReady:
                if (msg.host_peer_id == this.peerId) { // iam host
                    this.iamHost = true
                    this.hostPeerId = this.peerId
                    if (msg.peer_id == this.peerId) {
                        this.updateP2pConnectionState()
                        return
                    }

                    const connection = new P2pConnection(this, msg.peer_id, this.peerId, this.iamHost, this.iceConfig, this.heartbeatConfig)
                    this.connections.set(msg.peer_id, connection)

                    const rtcPeerConnection = connection.setupRTCPeerConnection()
                    if (!rtcPeerConnection) {
                        // TODO: failed case
                        return
                    }
                    rtcPeerConnection.createOffer()
                        .then(offer => {
                            return rtcPeerConnection.setLocalDescription(offer)
                        })
                        .then(() => {
                            let offer = {"host_peer_id": msg.host_peer_id}
                            offer[ConnectionState.SdpOffer] = JSON.stringify(rtcPeerConnection.localDescription)
                            this.signal(ConnectionState.SdpOffer, offer)
                        })
                        .catch(err => console.log(err))
                }

                this.state = ConnectionState.SessionReady

                break
            case ConnectionState.SdpOffer:
                if (msg.host_peer_id != this.peerId && this.state != ConnectionState.SdpOffer) { // iam not host
                    this.hostPeerId = msg.host_peer_id
                    const connection = new P2pConnection(this, this.peerId, msg.host_peer_id, this.iamHost, this.iceConfig, this.heartbeatConfig)
                    this.connections.set(this.peerId, connection)
                    
                    const rtcPeerConnection = connection.setupRTCPeerConnection()

                    let offer = JSON.parse(msg[ConnectionState.SdpOffer])
                    // console.log(`${this.peerId} get Offer`)
                    // console.log(offer)
                    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(offer))
                        .then(() => {
                            rtcPeerConnection.createAnswer()
                                .then(answer => {
                                    return rtcPeerConnection.setLocalDescription(answer)
                                })
                                .then(() => {
                                    let answer = {"host_peer_id": msg.host_peer_id}
                                    answer[ConnectionState.SdpAnswer] = JSON.stringify(rtcPeerConnection.localDescription)
                                    this.signal(ConnectionState.SdpAnswer, answer)
                                })
                                .catch(err => console.log(err))
                        })
                }
                break
            case ConnectionState.SdpAnswer:
                if (msg.host_peer_id == this.peerId) { // iam host
                    // console.log(` ${this.peerId} get Answer`)
                    const clientConnection = this.connections.get(msg.peer_id)
                    if (!clientConnection) return;

                    const rtcPeerConnection = clientConnection.rtcPeerConnection
                    let answer = JSON.parse(msg[ConnectionState.SdpAnswer])
                    
                    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(answer))
                        .catch(err => console.log(err))
                }
                break
            case ConnectionState.IceCandidate:
                if (msg[ConnectionState.IceCandidate]) {
                    this.connections.forEach((connection, peerId) => {
                        connection.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(msg[ConnectionState.IceCandidate]))
                            .catch(err => console.log(err))
                    })
                }
                break
            case ConnectionState.Error:
                // console.log("Connection Error")
                break
            default:
                break
        }
    }

    dispatchP2pMessage(message, type, senderId) {
        this.connections.forEach((connection, peerId) => {
            connection.sendP2pMessage(message, type, senderId)
        })
    }
    
    sendP2pMessage(message) {
        if (this.iamHost) {
            this.container.dispatchP2pMessage({
                type: MessageType.Data,
                senderId: this.peerId,
                data: message
            })
        }

        this.connections.forEach((connection, peerId) => {
            connection.sendP2pMessage(message, MessageType.Data, this.peerId)
        })
    }

    receivedP2pMessage(message) {
        switch (message.type) {
            case MessageType.Data:
            case MessageType.DataConnectionState:
                if (this.iamHost) {
                    //broadcast to all connections
                    this.dispatchP2pMessage(message.data, message.type, message.senderId)
                }
                
                // dispatch msg to all sub views
                this.container.dispatchP2pMessage(message)
                break
            default:
                break
        }
    }

    updateP2pConnectionState(connection = null) {
        if (this.iamHost) {
            this.connectionStatus ||= {}
            this.connections.forEach((connection, peerId) => {
                this.connectionStatus[peerId] = connection.state
            })
            this.connectionStatus[this.hostPeerId] = ConnectionState.Connected

            this.container.dispatchP2pMessage({
                type: MessageType.DataConnectionState,
                senderId: this.peerId,
                data: this.connectionStatus
            })

            this.dispatchP2pMessage(this.connectionStatus, MessageType.DataConnectionState, this.hostPeerId)
        }

        if (connection) {
            this.dispatchP2pConnectionState(connection)
        }
    }

    dispatchP2pConnectionState(connection) {
        switch (connection.state) {
            case ConnectionState.Negotiating:
                this.container.p2pNegotiating()
                break
            case ConnectionState.Connecting:
                this.container.p2pConnecting()
                break
            case ConnectionState.Connected:
                this.container.p2pConnected()
                break
            case ConnectionState.DisConnected:
                this.container.p2pDisconnected()
                break
            case ConnectionState.Closed:
                this.container.p2pClosed()
                break
            case ConnectionState.Failed:
                this.container.p2pError()
                break
            default:
                break
          }
    }
}