# frozen_string_literal: true

class SignalingChannel < Turbo::StreamsChannel
    def receive(data)
        puts "Signaling Server receive #{data} #{params}"
        handle_session(data)
    end

    def handle_session(data)
        msg_type, peer_id, session = data["type"], data["peer_id"], P2pStreamsChannel::Session.from_json(JSON.parse(data["session"]))

        send_back_msg = \
            case msg_type
            when P2pStreamsChannel::STATE_JOIN
                session.join(peer_id)
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
