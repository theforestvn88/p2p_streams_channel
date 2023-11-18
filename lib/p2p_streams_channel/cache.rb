# frozen_string_literal: true

require_relative "./session_state"

module P2pStreamsChannel
    module_function
            
    # TODO: using rails cache
    FAKE_SESSION = {}

    def fetch_session_state(session_id)
        FAKE_SESSION[session_id] ||= SessionState.new
    end

    def save_session_state(session_id, session_state)
        # FAKE_SESSION[session_id] = session_state
    end
end
