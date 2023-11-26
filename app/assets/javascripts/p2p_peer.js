import { ConnectionState, MessageType } from "./message"
import P2pConnection from "./p2p_connection"

export default class P2pPeer {
    // TODO: add channelId
    constructor(peerId, container, signaling, session, config) {
        this.peerId = peerId
        this.iamHost = null
        this.container = container
        this.signaling = signaling
        this.session = session
        this.config = config
        this.state = null
    }

    setup() {
        this.connections = []

        console.log("SEND ConnectionState.SessionJoin")
        this.signal(ConnectionState.SessionJoin, {})
    }

    signal(state, data) {
        let msg = {
            "type": MessageType.Connection,
            "session": this.session,
            "peer_id": this.peerId,
            "state": state,
            ...data
        }
        console.log(msg)
        this.signaling.send(msg)
    }

    negotiate(msg) {
        console.log(msg)
        switch (msg.state) {
            case ConnectionState.SessionJoin:
                break
            case ConnectionState.SessionReady:
                if (msg.host_peer_id == this.peerId) { // iam host
                    this.iamHost = true
                    const connection = new P2pConnection(this, msg.peer_id, this.peerId, this.iamHost, this.config)
                    this.connections.push(connection)
                    console.log(this.connections)
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
                    const connection = new P2pConnection(this, this.peerId, msg.host_peer_id, this.iamHost, this.config)
                    this.connections.push(connection)
                    
                    const rtcPeerConnection = connection.setupRTCPeerConnection()

                    let offer = JSON.parse(msg[ConnectionState.SdpOffer])
                    console.log(`${this.peerId} get Offer`)
                    console.log(offer)
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
                    console.log(` ${this.peerId} get Answer`)
                    this.connections.forEach(c => console.log(c.peerId))
                    const clientConnection = this.connections.find(connection => connection.peerId == msg.peer_id)
                    console.log(clientConnection)
                    if (!clientConnection) return;

                    const rtcPeerConnection = clientConnection.rtcPeerConnection
                    let answer = JSON.parse(msg[ConnectionState.SdpAnswer])
                    
                    console.log(answer)
                    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(answer))
                        .catch(err => console.log(err))
                }
                break
            case ConnectionState.IceCandidate:
                if (msg[ConnectionState.IceCandidate]) {
                    this.connections.forEach(connection => {
                        connection.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(msg[ConnectionState.IceCandidate]))
                            .catch(err => console.log(err))
                    })
                }
                break
            case ConnectionState.Error:
                console.log(msg)
                break
            default:
                break
        }
    }

    sendP2pMessage(msg) {
        this.connections.forEach(connection => {
            connection.sendP2pMessage(msg)
        })
    }

    receivedP2pMessage(message) {
        const msg = JSON.parse(message)
        switch (msg.type) {
            case MessageType.Heartbeat:
                this.connections.forEach(connection => {
                    if (connection.peerId == msg.peerId || connection.peerId == msg.hostId) {
                        connection.state = ConnectionState.Connected
                        connection.lastTimeUpdate = Date.now()
                    }
                })                
                break
            case MessageType.Data:
                if (this.iamHost) {
                    //broadcast to all connections
                    this.sendP2pMessage(msg)
                }
    
                // dispatch msg to all sub views
                this.container.dispatchP2pMessage(msg)
                break
            default:
                break
        }
    }

    dispatchP2pConnectionState(peerId, hostId, iamHost, connectionState, ev) {
        switch (connectionState) {
            // case "new":
            // case "connecting":
            //   this.p2pConnecting(ev)
            //   break;
            case ConnectionState.Connected:
                this.container.p2pConnected(peerId, hostId, iamHost, ev)
                break
            case ConnectionState.DisConnected:
                this.container.p2pDisconnected(peerId, hostId, iamHost, ev)
                break
            case ConnectionState.Closed:
                this.container.p2pClosed(peerId, hostId, iamHost, ev)
                break
            case ConnectionState.Failed:
                this.container.p2pError(peerId, hostId, iamHost, ev)
                break
            default:
                break
          }
    }
}