# frozen_string_literal: true
require_relative "lib/p2p_streams_channel/version"

Gem::Specification.new do |spec|
  spec.name = "p2p_streams_channel"
  spec.version = P2pStreamsChannel::VERSION
  spec.authors = ["theforestvn88"]
  spec.email = ["theforestvn88@gmail.com"]

  spec.summary = "rails p2p turbo streams channel"
  spec.description = "rails p2p turbo streams channel"
  spec.homepage = "https://github.com/theforestvn88/p2p_streams_channel"
  spec.required_ruby_version = ">= 2.6.0"

  spec.metadata["allowed_push_host"] = "https://github.com/theforestvn88/p2p_streams_channel"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/theforestvn88/p2p_streams_channel"
  spec.metadata["changelog_uri"] = "https://github.com/theforestvn88/p2p_streams_channel"

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").reject do |f|
      (File.expand_path(f) == __FILE__) ||
        f.start_with?(*%w[bin/ test/ spec/ features/ .git .circleci appveyor Gemfile])
    end
  end
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_dependency "rails"
  spec.add_dependency 'turbo-rails'
  spec.add_dependency 'importmap-rails'
  spec.add_dependency 'stimulus-rails'

  spec.add_development_dependency 'rake'
  spec.add_development_dependency 'rspec-rails'
  spec.test_files = Dir["spec/**/*"]
end
