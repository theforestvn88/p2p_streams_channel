# frozen_string_literal: true

class SignalingChannel < Turbo::StreamsChannel
    def receive(data)
        puts "Signaling Server receive #{data} #{params}"
        handle_session(data)
    end

    def handle_session(data)
        session = P2pStreamsChannel.fetch_session(data["session_id"])

        send_back_msg = \
            case data["state"]
            when P2pStreamsChannel::STATE_JOIN
                session.join(data["peer_id"])
            else
                data
            end

        if send_back_msg.present?
            SignalingChannel.sync send_back_msg, to: session
        end
    end

    def self.sync(data, to:)
        ActionCable.server.broadcast stream_name_from(to), data
    end
end
