# frozen_string_literal: true

require_relative "p2p_streams_channel/version"
require_relative "p2p_streams_channel/engine"
require_relative "p2p_streams_channel/cache"
require_relative "p2p_streams_channel/session"
require_relative "p2p_streams_channel/session_handler"

require_relative  "rails/generators/p2p_streams_channel/install_generator"

module P2pStreamsChannel
  class Error < StandardError; end

  class Configuration
    attr_accessor :store
  end

  mattr_reader :configs, default: Configuration.new

  def config
    yield(configs)
  end
  module_function :config

  def store
      configs.store || Rails.cache
  end
  module_function :store
end
