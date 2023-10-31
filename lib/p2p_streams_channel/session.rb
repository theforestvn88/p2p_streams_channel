# frozen_string_literal: true

require_relative "./one_to_one"

module P2pStreamsChannel
    TYPE_ONE_TO_ONE = "121"
    TYPE_ONE_TO_MANY = "12*"
    TYPE_MANY_TO_MANY = "*2*"

    class Session
        attr_reader :id, :type, :clazz, :clazz_id
        
        def initialize(id, type, clazz = nil, clazz_id = nil)
            @id = id
            @type = type
            @clazz = clazz
            @clazz_id = clazz_id

            @connection = \
                case type
                when P2pStreamsChannel::TYPE_ONE_TO_ONE
                    OneToOne.new(@id)
                else
                    nil
                end
        end

        def to_param
            {id: @id, type: @type, clazz: @clazz, clazz_id: @clazz_id}.to_param
        end

        def self.from_json(json)
            P2pStreamsChannel::Session.new(json["id"], json["type"], json["clazz"], json["clazz_id"])
        end

        def join(peer_id)
            @connection&.join(peer_id)
        end
    end
end
