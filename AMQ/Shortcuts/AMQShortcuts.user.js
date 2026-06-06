// ==UserScript==
// @name         AMQ Shortcuts
// @namespace    https://github.com/JabroAMQ/
// @version      0.4.0
// @description  Some shortcuts to improve the game experience
// @author       Jabro
// @match        https://*.animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/raw/main/AMQ/Shortcuts/AMQShortcuts.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/raw/main/AMQ/Shortcuts/AMQShortcuts.user.js
// ==/UserScript==

const VERSION = '0.4.0';
const DELAY = 500;

// TODO
// - readme.md
// - AMQ_addScriptData()
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
    { id: 'checkFriendOnline', callback: checkFriendOnline, description: descriptions.checkFriendOnline },
    { id: 'showScriptsInfo', callback: showScriptsInfo, description: descriptions.showScriptsInfo },
];

let cachedShortcuts = {};
let friend_name = localStorage.getItem('AMQ_Shortcut_FriendName') ?? null;


if (document.getElementById('loginPage'))
    return;

const loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        loadShortcutsCache();
        setupKeyboardGlobalListener();
        addShortcutsSettingsTab();
    }
}, DELAY);


function loadShortcutsCache() {
    const savedKeys = JSON.parse(localStorage.getItem('AMQ_CustomShortcuts') || '{}');
    shortcuts.forEach(shortcut => {
        cachedShortcuts[shortcut.id] = savedKeys.hasOwnProperty(shortcut.id) ? savedKeys[shortcut.id] : null;
    });
}

function saveShortcutKey(shortcutId, newKey) {
    const cleanKey = newKey ? newKey.toLowerCase() : null;
    cachedShortcuts[shortcutId] = cleanKey;
    
    const savedKeys = JSON.parse(localStorage.getItem('AMQ_CustomShortcuts') || '{}');
    savedKeys[shortcutId] = cleanKey;
    localStorage.setItem('AMQ_CustomShortcuts', JSON.stringify(savedKeys));
}

function setupKeyboardGlobalListener() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            const pressedKey = e.key.toLowerCase();
            const activeShortcut = shortcuts.find(s => cachedShortcuts[s.id] !== null && cachedShortcuts[s.id] === pressedKey);
            
            if (activeShortcut) {
                e.preventDefault();
                activeShortcut.callback();
            }
        }
    });
}


function addShortcutsSettingsTab() {
    // Create the "Shortcuts" tab in settings
    $('#settingModal .tabContainer')
        .append($('<div></div>')
            .attr('id', 'smShortcutsTab')
            .addClass('tab shortcuts clickAble')
            .attr('onClick', "options.selectTab('shortcutsContainer', this)")
            .append($('<h5></h5>')
                .text('Shortcuts')
            )
        );

    // Create the body base for "Shortcuts" tab
    const shortcutsTabContent = $('<div></div>')
        .attr('id', 'shortcutsContainer')
        .addClass('settingContentContainer customScrollbar hide');
    $('#settingModal .modal-body').append(shortcutsTabContent);

    addShortcutsSettingsTabBodyContent();

    // Bind a click event listener to resize the settings modal width.
    $('#settingModal').on('shown.bs.modal', function () {
        const modalContent = $('#settingModal .modal-dialog');
        const modalTab = $('#settingModal .tabContainer');
        const desiredWidth = `${modalTab.width()}px`;
        modalContent.css('width', desiredWidth);
    });

    // Bind a click event listener to show the content of the "Shortcuts" tab when clicked
    $('#settingModal .tabContainer').on('click', '.shortcuts', function () {
        shortcutsTabContent.removeClass('hide');
    });

    // Bind a click event listener to hide the "Shortcuts" tab when another tab is clicked
    $('#settingModal .tabContainer').on('click', '.tab:not(.shortcuts)', function () {
        if (!shortcutsTabContent.hasClass('hide')) {
            shortcutsTabContent.addClass('hide');

            // Manually unselect the "Shortcuts" tab and select the one that was clicked
            $('#settingModal .tabContainer .tab').removeClass('selected');
            $(this).addClass('selected');
        }
    });
}

function addShortcutsSettingsTabBodyContent() {
    const shortcutsTabContent = $('#shortcutsContainer');
    const formContainer = $('<div></div>').addClass('amq-shortcuts-form-container');

    shortcuts.forEach(shortcut => {
        const currentKey = cachedShortcuts[shortcut.id];
        const displayValue = currentKey ? `Ctrl + ${currentKey.toUpperCase()}` : 'None';

        const row = $('<div></div>').addClass('amq-shortcut-card');
        const label = $('<label></label>')
            .text(shortcut.description)
            .addClass('amq-shortcut-description');

        const inputContainer = $('<div></div>').addClass('amq-shortcut-input-container');
        const input = $('<input>')
            .attr('type', 'text')
            .attr('readonly', true)
            .addClass('form-control text-center amq-shortcut-key-input')
            .addClass(currentKey ? 'amq-shortcut-key-active' : 'amq-shortcut-key-disabled')
            .val(displayValue)
            .attr('placeholder', 'Press a key...');

        input.on('keydown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Disable shortcut if Backspace or Delete is pressed
            if (e.key === 'Backspace' || e.key === 'Delete') {
                saveShortcutKey(shortcut.id, null);
                $(this).val('None')
                       .removeClass('amq-shortcut-key-active')
                       .addClass('amq-shortcut-key-disabled');
                $(this).blur();
                return;
            }
            
            if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key))
                return;

            const pressedKey = e.key.toLowerCase();
            if (pressedKey.length === 1) {
                saveShortcutKey(shortcut.id, pressedKey);
                $(this).val(`Ctrl + ${pressedKey.toUpperCase()}`)
                       .removeClass('amq-shortcut-key-disabled')
                       .addClass('amq-shortcut-key-active');
                $(this).blur(); 
            }
        });

        inputContainer.append(input);
        row.append(label).append(inputContainer);

        if (shortcut.id === 'checkFriendOnline')
            addCheckFriendOnlineExtraInfo(row);

        formContainer.append(row);
    });

    shortcutsTabContent.append(formContainer);
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
                    profileButton.click();      // Close the profile after opening the chat
                } else {
                    console.log("Start Chat button not found on screen.");
                    profileButton.click();      // Close the profile if the start chat button isn't found
                    return;
                }
            }, DELAY);

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

function showScriptsInfo() {
    const installedUserscriptsButton = document.getElementById('mpInstalled');
    installedUserscriptsButton.click();
}


AMQ_addStyle(`
    #shortcutsContainer {
        max-height: 580px;
        overflow-y: auto;
        padding-bottom: 20px;
    }

    .amq-shortcuts-form-container {
        max-width: 450px;
        margin: 25px auto 0 auto;
        padding: 0 10px;
    }

    .amq-shortcut-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 20px;
        padding: 14px 15px;
        background-color: rgba(0, 0, 0, 0.2);
        border: 1px solid #444;
        border-radius: 4px;
    }

    .amq-shortcut-description {
        font-weight: normal;
        font-size: 13px;
        color: #ccc;
        margin: 0 0 10px 0;
        line-height: 1.4;
    }

    .amq-shortcut-input-container {
        margin: 0;
        display: flex;
        justify-content: center;
    }

    .amq-shortcut-key-input {
        width: 120px;
        cursor: pointer;
        background-color: #1b1b1b !important;
        font-weight: bold;
        border: 1px solid #555;
    }

    .amq-shortcut-key-active {
        color: #449d44;
    }

    .amq-shortcut-key-disabled {
        color: #999;
    }

    .amq-shortcut-extra-container {
        margin-top: 12px;
        width: 100%;
        max-width: 220px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .amq-shortcut-extra-input {
        background-color: #1b1b1b !important;
        color: #fff;
        border: 1px solid #555;
        font-size: 12px;
        height: 28px;
        padding: 4px;
    }
`);

AMQ_addScriptData({
    name: 'Shortcuts',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/Shortcuts/AMQShortcuts.user.js',
    version: VERSION,
    description: `
        <p>Placeholder</p>
    `
});