# frozen_string_literal: true

class SignalingChannel < Turbo::StreamsChannel
    def receive(data)
        puts "Signaling Server receive #{data} #{params}"
        streamable = data["session"]["clazz"].classify.constantize.find(data["session"]["id"])
        SignalingChannel.sync data, to: streamable
    end

    def self.sync(data, to:)
        ActionCable.server.broadcast stream_name_from(to), data
    end
end
