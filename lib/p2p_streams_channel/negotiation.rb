# frozen_string_literal: true

require_relative "./cache"

module P2pStreamsChannel
    class Negotiation
        attr_reader :session_id

        def initialize(session_id)
            @session_id = session_id
        end

        def session_state
            @session_state ||= P2pStreamsChannel.fetch_session_state(session_id)
        end

        def join(peer_id)
            session_state.add_peer(peer_id)
            save_session_state
            session_state.host_ready? ? session_state.ready_response(peer_id) : nil
        rescue => e
            session_state.error_response(e)
        end

        def save_session_state
            P2pStreamsChannel.save_session_state(@session_id, session_state)
        end
    end
end
