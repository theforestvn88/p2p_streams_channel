# frozen_string_literal: true

module P2pStreamsChannel
    class Engine < ::Rails::Engine
        config.autoload_once_paths = %W( #{root}/app/channels )

        config.autoload_once_paths = %W( #{root}/app/helpers )
        initializer "p2p_streams_channel.helpers" do
            ActiveSupport.on_load(:action_controller_base) do
              helper P2pStreamsChannel::Engine.helpers
            end
        end
    end
end
