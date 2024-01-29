# frozen_string_literal: true

RSpec.describe P2pStreamsChannel::Session do
    subject { P2pStreamsChannel::Session.new("test", secret_key: "123") }

    it "default the first joined peer is the host" do
        subject.join_peer(1)
        expect(subject.session_state.host_peer_id).to be(1)
    end

    it "connect/disconnect peer" do
        subject.join_peer(6) # host
        expect(subject.session_state.peers[6]).to be(true)
        
        subject.join_peer(15)
        expect(subject.session_state.peers[15]).to be(true)
        subject.disconnect_peer(15)
        expect(subject.session_state.peers[15]).to be(false)
    end

    it "if the host peer disconnect then session should be reset" do
        subject.join_peer(6)
        subject.join_peer(15)

        subject.disconnect_peer(6)
        expect(subject.session_state.peers).to be_empty
        expect(subject.session_state.host_peer_id).to be_nil
    end
end
