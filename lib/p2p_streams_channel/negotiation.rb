# frozen_string_literal: true

require_relative "./cache"

module P2pStreamsChannel
    class Negotiation
        def join(peer_id, session_state)
            session_state.add_peer(peer_id)
            session_state.host_ready? ? ready_response(peer_id, session_state) : nil
        rescue => e
            error_response(e, session_state)
        end

        def ready_response(peer_id, session_state)
            {
                "type": P2pStreamsChannel::MESSAGE_TYPE,
                "state": P2pStreamsChannel::STATE_READY,
                "host_peer_id": session_state.host_peer_id,
                "peer_id": peer_id
            }
        end

        def error_response(err, session_state)
            # TODO:
        end
    end
end
