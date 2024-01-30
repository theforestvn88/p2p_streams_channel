# frozen_string_literal: true

require_relative "./negotiation"

module P2pStreamsChannel
    # TODO: support optional :db -> save session to db
    class Session
        attr_reader :id, :secret_key, :negotiation, :session_state
        
        def initialize(id, secret_key: "")
            @id = id
            @secret_key = secret_key
            @negotiation = Negotiation.new
            @session_state = SessionState.new
        end

        def signature
            {id: @id}
        end

        def to_param
            signature.to_param
        end

        def to_json
            signature.to_json
        end

        def join_peer(peer_id)
            @negotiation.join(peer_id, session_state).tap do |response|
                save!
            end
        end

        def disconnect_peer(peer_id)
            if session_state.host_peer_id == peer_id
                reset_state
            else
                session_state.remove_peer(peer_id)
                save!
            end
        end

        def is_host_peer?(peer_id)
            session_state.host_peer_id == peer_id
        end

        def reset_state
            @session_state = SessionState.new
            save!
        end

        def save!
            P2pStreamsChannel.save_session(self)
        end
    end
end
