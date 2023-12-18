# frozen_string_literal: true

require_relative "./negotiation"

module P2pStreamsChannel
    # TODO: support optional :db -> save session to db
    class Session
        attr_reader :id, :secret_key, :negotiation
        
        def initialize(id, secret_key: "")
            @id = id
            @secret_key = secret_key
            @negotiation = Negotiation.new(@id)
        end

        def signature
            {id: @id, secret_key: @secret_key}
        end

        def to_param
            signature.to_param
        end

        def to_json
            signature.to_json
        end

        def join(peer_id)
            @negotiation.join(peer_id).tap do |_|
                P2pStreamsChannel.save_session(self)
            end
        end

        def state
            negotiation.session_state
        end
    end
end
