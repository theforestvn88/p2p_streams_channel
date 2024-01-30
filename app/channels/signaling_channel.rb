# frozen_string_literal: true

class SignalingChannel < Turbo::StreamsChannel
    def subscribed
        super
        
        # TODO: user_id, session_id, is_host
        @session_id = params["session_id"]
        @peer_id = params["peer_id"]
    end

    def receive(data)
        puts "Signaling Server peer #{@peer_id} receive #{data} #{params}"
        send_back_msg = P2pStreamsChannel.resolve(data)
        if send_back_msg.present?
            SignalingChannel.sync send_back_msg, to: P2pStreamsChannel.fetch_session(data["session_id"])
        end
    end

    def unsubscribed
        super

        P2pStreamsChannel.disconnect_if_host_peer(@session_id, @peer_id)
    end

    def self.sync(data, to:)
        ActionCable.server.broadcast stream_name_from(to), data
    end
end
