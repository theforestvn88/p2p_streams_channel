require "spec_helper"

RSpec.describe "p2p send data", type: :system do
    it "send from one peer to all peers" do
        Rails.cache.clear

        window1 = open_new_window
        window2 = open_new_window
        window3 = open_new_window

        page.switch_to_window(page.windows[0])
        visit "/"
        find('input[placeholder="name"]').set "host"
        find('input[type="submit"]').click

        page.switch_to_window(page.windows[1])
        visit "/"
        find('input[placeholder="name"]').set "peer1"
        find('input[type="submit"]').click

        page.switch_to_window(page.windows[2])
        visit "/"
        find('input[placeholder="name"]').set "peer2"
        find('input[type="submit"]').click

        # send data from peer on tab 2
        find('input[data-chat-target="message"]', wait: 100).set "hello"
        find('input[data-action="chat#send"]').click

        expect(page).to have_content("peer2: hello")
        
        page.switch_to_window(page.windows[0])
        expect(page).to have_content("peer2: hello")

        page.switch_to_window(page.windows[1])
        expect(page).to have_content("peer2: hello")

        # send data from host peer
        # test case host did not receive his message
        page.switch_to_window(page.windows[0])
        find('input[data-chat-target="message"]', wait: 100).set "iam host"
        find('input[data-action="chat#send"]').click
        
        expect(page).to have_content("host: iam host")

        page.switch_to_window(page.windows[1])
        expect(page).to have_content("host: iam host")

        page.switch_to_window(page.windows[2])
        expect(page).to have_content("host: iam host")
    end
end
