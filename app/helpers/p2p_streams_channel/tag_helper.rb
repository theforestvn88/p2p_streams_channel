# frozen_string_literal: true

module P2pStreamsChannel::TagHelper
    def p2p_frame_tag(session_id:, peer_id:, **params, &block)
        session = P2pStreamsChannel.fetch_session(session_id, **params)
        signed_stream_name = Turbo::StreamsChannel.signed_stream_name(session)
        content = capture(&block)

        %(
            <p2p-frame data-controller="#{params[:controller]}" channel="SignalingChannel" signed-stream-name="#{signed_stream_name}" 
                session-id=#{session.id} peer-id="#{peer_id}" params=#{params.to_json}>
                #{content}
            </p2p-frame>
        ).html_safe
    end
end
