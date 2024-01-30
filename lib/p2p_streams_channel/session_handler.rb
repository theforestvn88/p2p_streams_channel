module P2pStreamsChannel
    module_function

    CONNECTION_MESSAGE_TYPE = "Connection".freeze
    REQUEST_MESSAGE_TYPE = "Request".freeze

    def resolve(message)
        case message["type"]
        when CONNECTION_MESSAGE_TYPE
            handle_session(message)
        when REQUEST_MESSAGE_TYPE
        else
        end
    end

    def handle_session(data)
        case data["state"]
        when P2pStreamsChannel::STATE_SESSION_JOIN
            if session = P2pStreamsChannel.fetch_session(data["session_id"])
                session.join_peer(data["peer_id"])
            end
        when P2pStreamsChannel::STATE_CONNECTED
        else
            data
        end
    end

    def disconnect_if_host_peer(session_id, peer_id)
        if session = P2pStreamsChannel.fetch_session(session_id)
            if session.is_host_peer?(peer_id)
                session.disconnect_peer(peer_id)
            end
        end
    end
end
