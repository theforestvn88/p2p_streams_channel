require "spec_helper"

RSpec.describe "p2p peer status", type: :system do
    before do
        Rails.cache.clear
    end

    it "should update status when new peer join" do
        open_new_window
        open_new_window
        open_new_window

        page.switch_to_window(page.windows[0])
        visit "/"
        find('input[placeholder="name"]').set "host"
        find('input[type="submit"]').click
        expect(page).to have_content("host: connected", wait: 100)

        page.switch_to_window(page.windows[1])
        visit "/"
        find('input[placeholder="name"]').set "peer1"
        find('input[type="submit"]').click
        expect(page).to have_content("host: connected", wait: 100)
        expect(page).to have_content("peer1: connected", wait: 100)

        page.switch_to_window(page.windows[2])
        visit "/"
        find('input[placeholder="name"]').set "peer2"
        find('input[type="submit"]').click
        expect(page).to have_content("host: connected", wait: 100)
        expect(page).to have_content("peer1: connected", wait: 100)
        expect(page).to have_content("peer2: connected", wait: 100)
    end

    it "should update status when a peer disconnected" do
        open_new_window
        open_new_window
        open_new_window

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

        page.windows[1].close
        expect(page).to have_content("peer1: disconnected", wait: 100)
    end

    it "should show streams disconnected state when host disconnected" do
        open_new_window
        open_new_window
        open_new_window

        page.switch_to_window(page.windows[1])
        visit "/"
        find('input[placeholder="name"]').set "host"
        find('input[type="submit"]').click

        page.switch_to_window(page.windows[2])
        visit "/"
        find('input[placeholder="name"]').set "peer1"
        find('input[type="submit"]').click
        expect(page).to have_content("host: connected", wait: 100)

        page.switch_to_window(page.windows[3])
        visit "/"
        find('input[placeholder="name"]').set "peer2"
        find('input[type="submit"]').click
        expect(page).to have_content("host: connected", wait: 100)

        page.windows[1].close

        page.switch_to_window(page.windows[1])
        expect(page).to have_content("Stream disconnected! please refresh to continue", wait: 100)

        page.switch_to_window(page.windows[2])
        expect(page).to have_content("Stream disconnected! please refresh to continue", wait: 100)
    end
end
