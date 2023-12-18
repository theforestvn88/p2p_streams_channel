# frozen_string_literal: true

require_relative "./cache"

module P2pStreamsChannel
    class Negotiation
        attr_reader :session_id, :session_state

        def initialize(session_id)
            @session_id = session_id
            @session_state = SessionState.new
        end

        def join(peer_id)
            session_state.add_peer(peer_id)
            session_state.host_ready? ? session_state.ready_response(peer_id) : nil
        rescue => e
            session_state.error_response(e)
        end
    end
end
