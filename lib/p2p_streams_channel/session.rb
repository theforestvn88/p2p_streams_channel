# frozen_string_literal: true

require_relative "./negotiation"

module P2pStreamsChannel
    class Session
        attr_reader :id
        
        def initialize(id)
            @id = id
            @negotiation = Negotiation.new(@id)
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

        def self.from_json(json)
            P2pStreamsChannel::Session.new(json["id"], json["type"])
        end

        def join(peer_id)
            @negotiation.join(peer_id)
        end

        def connected
            # TODO: when peers connected -> stop signaling connection
        end
    end
end
