import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static values = { session: String, channel: String }
}
