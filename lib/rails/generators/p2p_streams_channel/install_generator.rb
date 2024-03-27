# frozen_string_literal: true
require "rails/generators"

module P2pStreamsChannel
  class InstallGenerator < ::Rails::Generators::Base
    source_root File.expand_path("../templates", __FILE__)
    
    def importmap
      return unless (importmap_path = Rails.root.join("config/importmap.rb")).exist?
      
      append_to_file importmap_path, %(\npin_all_from "#{File.expand_path("../../../../app/assets/javascripts/p2p/", __dir__)}", under: "p2p"\n)
    end

    def node
      return unless Rails.root.join("package.json").exist?

      run "yarn add p2p@file:#{File.expand_path("../../../../app/assets/javascripts/p2p/", __dir__)}"
    end

    def create_initializer
      copy_file "initializer.rb", "config/initializers/p2p_streams_channel.rb"
    end
  end
end
