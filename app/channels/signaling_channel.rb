# frozen_string_literal: true

class SignalingChannel < Turbo::StreamsChannel
    def subscribed
        # TODO: user_id, session_id
    end

    def receive(data)
        puts "Signaling Server receive #{data} #{params}"
        handle_session(data)
    end

    def handle_session(data)
        send_back_msg = \
            case data["state"]
            when P2pStreamsChannel::STATE_JOIN
                @session_id = data["session_id"]
                session = fetch_session
                return if session.nil?

                session.join_peer(@peer_id = data["peer_id"])
            else
                data
            end

        if send_back_msg.present?
            SignalingChannel.sync send_back_msg, to: session
        end
    end

    def  
        fetch_session.disconnect_peer(@peer_id)
    end

    def self.sync(data, to:)
        ActionCable.server.broadcast stream_name_from(to), data
    end

    private def fetch_session
        P2pStreamsChannel.fetch_session(@session_id)
    end
end
