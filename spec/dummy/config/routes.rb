Rails.application.routes.draw do
  root 'p2p#index'
  post '/chat', to: 'p2p#room_chat', as: :join_room_chat
end
