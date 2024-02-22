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
        P2pStreamsChannel.store.fetch(session_id, expires_in: params[:expires_in]) do
            P2pStreamsChannel::Session.new(session_id, secret_key: params[:secret_key])
        end
    end

    def save_session(session)
        P2pStreamsChannel.store.write(session.id, session)
    end
end
