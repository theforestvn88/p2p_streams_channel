# frozen_string_literal: true

require_relative "./session_state"

module P2pStreamsChannel
    module_function
            
    def fetch_session(session_id, **options, &block)
        Rails.cache.fetch(session_id, **options) do
            block&.call
        end
    end

    def save_session(session)
        Rails.cache.write(session.id, session)
    end
end
