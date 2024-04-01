# frozen_string_literal: true
require "rails/generators"

module P2pStreamsChannel
  class InstallGenerator < ::Rails::Generators::Base
    source_root File.expand_path("../templates", __FILE__)
    
    def copy_p2p
      empty_directory "vendor/javascript/p2p"
      directory "p2p", "vendor/javascript/p2p"
    end

    def importmap
      return unless (importmap_path = Rails.root.join("config/importmap.rb")).exist?
      
      append_to_file importmap_path, %(\npin_all_from "vendor/javascript/p2p", under: "p2p"\n)
      append_to_file Rails.root.join("app/assets/config/manifest.js"), %(\n//= link_tree ../../../vendor/javascript .js\n)
    end

    def node
      return unless Rails.root.join("package.json").exist?

      run "yarn add p2p@file:vendor/javascript/p2p"
    end

    def create_initializer
      copy_file "initializer.rb", "config/initializers/p2p_streams_channel.rb"
    end
  end
end
