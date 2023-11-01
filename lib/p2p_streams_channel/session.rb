# frozen_string_literal: true

require_relative "./one_to_one"

module P2pStreamsChannel
    TYPE_ONE_TO_ONE = "121"
    TYPE_ONE_TO_MANY = "12*"
    TYPE_MANY_TO_MANY = "*2*"

    class Session
        attr_reader :id, :type
        
        def initialize(id, type)
            @id = id
            @type = type

            @connection = \
                case type
                when P2pStreamsChannel::TYPE_ONE_TO_ONE
                    OneToOne.new(@id)
                else
                    nil
                end
        end

        def signature
            {id: @id, type: @type}
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
            @connection&.join(peer_id)
        end

        def connected
            # TODO: when peers connected -> stop signaling connection
        end
    end
end
