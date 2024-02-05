require "spec_helper"

RSpec.describe "p2p send data", type: :system do
    it "send from one peer to all peers" do
        Rails.cache.clear

        window1 = open_new_window
        window2 = open_new_window
        window3 = open_new_window

        page.switch_to_window(page.windows[0])
        visit "/"
        page.switch_to_window(page.windows[1])
        visit "/"
        page.switch_to_window(page.windows[2])
        visit "/"
        # send data from peer on tab 2
        find('input[data-chat-target="message"]', wait: 100).set "hello"
        find('input[data-action="chat#send"]').click

        page.switch_to_window(page.windows[0])
        expect(page).to have_content("hello")

        page.switch_to_window(page.windows[1])
        expect(page).to have_content("hello")
    end
end
