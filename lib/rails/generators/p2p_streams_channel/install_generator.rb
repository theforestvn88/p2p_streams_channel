# frozen_string_literal: true
require "rails/generators"

module P2pStreamsChannel
  class InstallGenerator < ::Rails::Generators::Base
    source_root File.expand_path("../templates", __FILE__)
    
    def create_initializer
      copy_file "initializer.rb", "config/initializers/p2p_streams_channel.rb"
    end
  end
end
