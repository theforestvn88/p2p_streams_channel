# frozen_string_literal: true

require_relative "./session_state"

module P2pStreamsChannel
    module_function

    # TODO:
    # params[start_time]
    # params[end_time]
    # params[max_number_of_peers]
    #
    def fetch_session(session_id, **params)
        Rails.cache.fetch(session_id) do
            P2pStreamsChannel::Session.new(session_id, secret_key: params[:secret_key])
        end
    end

    def save_session(session)
        Rails.cache.write(session.id, session)
    end
end
