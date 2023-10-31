# frozen_string_literal: true

module P2pStreamsChannel
    STATE_JOIN = "SessionJoin"
    STATE_READY = "SessionReady"

    class SessionState
        attr_reader :peers

        def initialize
            @peers = {}
        end

        def add_peer(peer_id)
            @peers[peer_id] = true
        end

        def num_of_connected_peers
            @peers.count { |peer, connected| connected == true }
        end
    end
end
