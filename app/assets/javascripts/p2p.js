import "./p2p_frame"

import P2pController from "./p2p_controller"
window.Stimulus.register("p2p", P2pController)

// TODO: create p2p class that handle setup connections
export { 
    P2pController
}