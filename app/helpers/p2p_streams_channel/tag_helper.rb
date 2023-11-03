# frozen_string_literal: true

module P2pStreamsChannel::TagHelper
    def p2p_frame_tag(id, type, peer_id, **params, &block)
        session = P2pStreamsChannel::Session.new(id, type)
        signed_stream_name = Turbo::StreamsChannel.signed_stream_name(session)
        content = capture(&block)
        
        %(
            <p2p-frame data-controller="p2p" channel="SignalingChannel" signed-stream-name="#{signed_stream_name}" 
                session=#{session.to_json} peer-id="#{peer_id}" params=#{params.to_json}>
                #{content}
            </p2p-frame>
        ).html_safe
    end

    def one_to_one_p2p_frame_tag(id, peer_id, **params, &block)
        p2p_frame_tag(id, P2pStreamsChannel::TYPE_ONE_TO_ONE, peer_id, **params, &block)
    end

    def one_to_many_p2p_frame_tag(id, peer_id, **params, &block)
        p2p_frame_tag(id, P2pStreamsChannel::TYPE_ONE_TO_MANY, peer_id, **params, &block)
    end

    def many_to_many_p2p_frame_tag(id, peer_id, **params, &block)
        p2p_frame_tag(id, P2pStreamsChannel::TYPE_MANY_TO_MANY, peer_id, **params, &block)
    end
end
