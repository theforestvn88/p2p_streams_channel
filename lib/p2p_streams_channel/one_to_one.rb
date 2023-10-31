# frozen_string_literal: true

require_relative "./cache"

module P2pStreamsChannel
    class OneToOne
        attr_reader :session_id

        def initialize(session_id)
            @session_id = session_id
        end

        def session_state
            @session_state ||= P2pStreamsChannel.fetch_session_state(session_id)
        end

        def join(peer_id)
            session_state.add_peer(peer_id)
            session_state.num_of_connected_peers == 2 ? ready : nil
        end

        def ready
            {
                "type": P2pStreamsChannel::STATE_READY,
                "host": session_state.peers.first.first
            }
        end
    end
end
