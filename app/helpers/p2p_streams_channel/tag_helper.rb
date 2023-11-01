# frozen_string_literal: true

module P2pStreamsChannel::TagHelper
    def p2p_frame_tag(id, type, peer_id, **params)
        session = P2pStreamsChannel::Session.new(id, type)
        signed_stream_name = Turbo::StreamsChannel.signed_stream_name(session)
        %(<p2p-frame data-controller="p2p" channel="SignalingChannel" signed-stream-name="#{signed_stream_name}" session=#{session.to_json} peer-id="#{peer_id}" params=#{params.to_json}></p2p-frame>).html_safe
    end

    def one_to_one_p2p_frame_tag(id, peer_id, **params)
        p2p_frame_tag(id, P2pStreamsChannel::TYPE_ONE_TO_ONE, peer_id, **params)
    end

    def one_to_many_p2p_frame_tag(id, peer_id, **params)
        p2p_frame_tag(id, P2pStreamsChannel::TYPE_ONE_TO_MANY, peer_id, **params)
    end

    def many_to_many_p2p_frame_tag(id, peer_id, **params)
        p2p_frame_tag(id, P2pStreamsChannel::TYPE_MANY_TO_MANY, peer_id, **params)
    end
end
