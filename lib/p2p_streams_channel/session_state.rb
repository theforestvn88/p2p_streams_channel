# frozen_string_literal: true

module P2pStreamsChannel
    MESSAGE_TYPE = "Connection".freeze
    STATE_JOIN = "SessionJoin".freeze
    STATE_READY = "SessionReady".freeze

    class SessionState
        attr_reader :peers, :host_peer_id

        def initialize(host_peer_id = nil)
            @peers = {}
            @host_peer_id = host_peer_id
        end

        def add_peer(peer_id)
            @peers[peer_id] = true
            @host_peer_id = peer_id if @host_peer_id.nil?
        end

        def num_of_connected_peers
            @peers.count { |peer, connected| connected == true }
        end

        def host_ready?
            @peers[@host_peer_id] == true 
        end

        def ready_response(peer_id)
            {
                "type": P2pStreamsChannel::MESSAGE_TYPE,
                "state": P2pStreamsChannel::STATE_READY,
                "host_peer_id": @host_peer_id,
                "peer_id": peer_id
            }
        end

        def error_response(err)
        end
    end
end
