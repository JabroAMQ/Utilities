// ==UserScript==
// @name         AMQ Shortcuts
// @namespace    https://github.com/JabroAMQ/
// @version      0.5.0
// @description  Some shortcuts to improve the game experience
// @author       Jabro
// @match        https://*.animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/Shortcuts/baseShortcut.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/raw/main/AMQ/Shortcuts/AMQShortcuts.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/raw/main/AMQ/Shortcuts/AMQShortcuts.user.js
// ==/UserScript==

const VERSION = '0.5.0';
const DELAY = 500;

// TODO
// - readme.md
// - Shortcut for selecting the answer input in quiz
// - Shortcut for selecting the chat input inside a lobby

const descriptions = {
    checkFriendOnline: 'Check if the friend (name below) is online, opening their dm if so',
    showScriptsInfo: 'Open/Close Joseph\'s "Installed Userscripts" modal',
    showSettingsListTab: 'Open/Close the Anime List tab from the Settings modal',
    showShortcutsTab: 'Open/Close the Shortcuts tab from the Settings modal',
    showSongList: 'Open/Close the song list',
    voteSkip: 'Vote to skip the current song',
};

const shortcuts = [
    { id: 'voteSkip', callback: voteSkip, description: descriptions.voteSkip },
    { id: 'showSongList', callback: showSongList, description: descriptions.showSongList },
    { id: 'showSettingsListTab', callback: showSettingsListTab, description: descriptions.showSettingsListTab },
    { id: 'showShortcutsTab', callback: showShortcutsTab, description: descriptions.showShortcutsTab },
    { id: 'checkFriendOnline', callback: checkFriendOnline, description: descriptions.checkFriendOnline, renderExtraInfo: addCheckFriendOnlineExtraInfo }, 
    { id: 'showScriptsInfo', callback: showScriptsInfo, description: descriptions.showScriptsInfo },
];

let friend_name = localStorage.getItem('AMQ_Shortcut_FriendName') ?? null;


if (document.getElementById('loginPage'))
    return;

const loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        loadShortcuts();
    }
}, DELAY);

function loadShortcuts() {
    if (!window.ShortcutManager) {
        console.error("ShortcutManager library could not be loaded via @require.");
        return;
    }

    shortcuts.forEach(shortcut => {
        window.ShortcutManager.register({
            id: shortcut.id,
            description: shortcut.description,
            callback: shortcut.callback,
            renderExtraInfo: shortcut.renderExtraInfo
        });
    });

    window.ShortcutManager.init();
}


function voteSkip() {
    const qpInputVoteSkip = document.getElementById('qpInputVoteSkip');
    if (qpInputVoteSkip) {
        qpInputVoteSkip.click();
    }
}


function showSongList() {
    if (typeof songHistoryWindow !== 'undefined' && typeof songHistoryWindow.trigger === 'function') {
        songHistoryWindow.trigger();
    }
}


function showSettingsListTab() {
    const settingsListItem = document.getElementById('optionListSettings');
    settingsListItem.click();

    const animeListTab = document.getElementById('smAnimeListTab');
    animeListTab.click();
}


function showShortcutsTab() {
    const settingsListItem = document.getElementById('optionListSettings');
    settingsListItem.click();

    const shortcutsTab = document.getElementById('smShortcutsTab');
    shortcutsTab.click();
}


function checkFriendOnline() {
    if (!friend_name) {
        console.log("No friend name configured for this shortcut.");
        return;
    }

    const onlineFriends = document.querySelectorAll('#friendOnlineList .socialTabFriendPlayerEntry');
    for (const friend of onlineFriends) {
        const name = friend.querySelector('.stPlayerNameContainer h4')?.textContent.trim();

        if (name === friend_name) {
            const profileButton = friend.querySelector('.stPlayerProfileButton');
            if (profileButton) {
                profileButton.click();
            }
            else {
                console.log("Profile button not found for friend:", friend_name);
                return;
            }

            setTimeout(() => {
                const startChatButton = document.querySelector('.ppFooterContainer .startChat');
                if (startChatButton) {
                    startChatButton.click();

                    setTimeout(() => {
                        const chatBoxes = document.querySelectorAll('.chatBoxContainer');
                        
                        for (const box of chatBoxes) {
                            const chatTargetName = box.querySelector('.chatTopBar p')?.textContent.trim();
                            
                            if (chatTargetName === friend_name) {
                                const textarea = box.querySelector('.textAreaContainer textarea');
                                if (textarea) {
                                    textarea.focus();
                                }
                                break;
                            }
                        }
                    }, DELAY);

                } else {
                    console.log("Start Chat button not found on screen.");
                }
            }, DELAY);

            profileButton.click();      // Close the profile after opening the chat
            return;
        }
    };

    // Check if the friend is in the offline list (this is to ensure the name doesn't have typos)
    const offlineFriends = document.querySelectorAll('#friendOfflineList .socialTabFriendPlayerEntry');
    for (const friend of offlineFriends) {
        const name = friend.querySelector('.stPlayerNameContainer h4')?.textContent.trim();

        if (name === friend_name) {
            Swal.fire({
                title: 'Search result',
                text: `${friend_name} is not online`,
                showConfirmButton: true,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
            return;
        }
    };

    // Send warning if the user is not found
    Swal.fire({
        title: 'Search result',
        text: `${friend_name} is not in your friend list... Are you sure the name is correct?`,
        showConfirmButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    });
}

function addCheckFriendOnlineExtraInfo(row) {
    const friendSettingContainer = $('<div></div>').addClass('amq-shortcut-extra-container');

    const friendInput = $('<input>')
        .attr('type', 'text')
        .addClass('form-control text-center amq-shortcut-extra-input')
        .val(friend_name ?? '')
        .attr('placeholder', "None (Type a name...)");

    friendInput.on('input', function() {
        const value = $(this).val().trim();

        if (value === '') {
            friend_name = null;
            localStorage.removeItem('AMQ_Shortcut_FriendName');
        } else {
            friend_name = value;
            localStorage.setItem('AMQ_Shortcut_FriendName', value);
        }
    });

    friendSettingContainer.append(friendInput);
    row.append(friendSettingContainer);
}


function showScriptsInfo() {
    const installedUserscriptsButton = document.getElementById('mpInstalled');
    installedUserscriptsButton.click();
}