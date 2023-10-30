# frozen_string_literal: true

class SignalingChannel < Turbo::StreamsChannel
    def receive(data)
        puts "Signaling Server receive #{data} #{params}"
        handle_session(data)
    end

    def handle_session(data)
        msg_type, peer_id, session = data["type"], data["peer_id"], JSON.parse(data["session"])

        send_back_msg = case msg_type
        when "SessionJoin"
            session_join(msg_type, peer_id, session)
        else
            data
        end

        if send_back_msg.present?
            streamable = session["clazz"].classify.constantize.find(session["clazz_id"])
            SignalingChannel.sync send_back_msg, to: streamable
        end
    end

    # TODO: using rails cache
    FAKE_SESSION = {}
    # TODO: encapsulating into session class
    def session_join(msg_type, peer_id, session)
        session_id = session["id"]
        
        # TODO: verify session

        # ok
        FAKE_SESSION[session_id] ||= {}
        unless FAKE_SESSION[session_id].has_key?(peer_id)
            FAKE_SESSION[session_id][peer_id] = true
        end

        case session["type"]
        when "121"
            FAKE_SESSION[session_id].size == 2 ? session_ready(peer_id, session_id) : nil
        else
            nil
        end
    end

    def session_ready(peer_id, session_id)
        {
            "type": "SessionReady",
            "host": FAKE_SESSION[session_id].first.first
        }
    end

    def self.sync(data, to:)
        ActionCable.server.broadcast stream_name_from(to), data
    end
end
