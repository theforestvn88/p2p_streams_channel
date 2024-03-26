# frozen_string_literal: true
require "rails/generators"

module P2pStreamsChannel
    class ControllerGenerator < ::Rails::Generators::NamedBase
        source_root File.expand_path("../templates", __FILE__)

        def p2p_controller_js
            copy_file "controller.js", "app/javascript/controllers/#{name}_controller.js"
        end
    end
end
