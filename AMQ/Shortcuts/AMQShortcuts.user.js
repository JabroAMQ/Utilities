// ==UserScript==
// @name         AMQ Shortcuts
// @namespace    https://github.com/JabroAMQ/
// @version      0.6.2
// @description  Some shortcuts to improve the game experience
// @author       Jabro
// @match        https://*.animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/Shortcuts/AMQShortcutsCore.js
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/raw/main/AMQ/Shortcuts/AMQShortcuts.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/raw/main/AMQ/Shortcuts/AMQShortcuts.user.js
// ==/UserScript==

// TODO
// - readme.md
// - Shortcut for selecting the answer input in quiz
// - Shortcut for selecting the chat input inside a lobby

const VERSION = '0.6.2';
const DELAY = 300;

const descriptions = {
    voteSkip: 'Vote to skip the current song',
    showSongList: 'Open/Close the song list',
    showScriptsInfo: 'Open/Close Joseph\'s "Installed Userscripts" modal',
    showSettingsListTab: 'Open the Anime List tab from the Settings modal',
    showShortcutsTab: 'Open the Shortcuts tab from the Settings modal',
    checkUserOnline: 'Check if the user (name below) is online, opening their dm if so',
};

const shortcuts = [
    { id: 'voteSkip', callback: voteSkip, description: descriptions.voteSkip },
    { id: 'showSongList', callback: showSongList, description: descriptions.showSongList },
    { id: 'showScriptsInfo', callback: showScriptsInfo, description: descriptions.showScriptsInfo },
    { id: 'showSettingsListTab', callback: showSettingsListTab, description: descriptions.showSettingsListTab },
    { id: 'showShortcutsTab', callback: showShortcutsTab, description: descriptions.showShortcutsTab },
    { id: 'checkUserOnline', callback: checkUserOnline, description: descriptions.checkUserOnline, renderExtraInfo: addCheckUserOnlineExtraInfo }, 
];

let userName = localStorage.getItem('AMQ_Shortcut_UserName') ?? null;


if (document.getElementById('loginPage'))
    return;

const loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        loadShortcuts();
    }
}, DELAY);

function loadShortcuts() {
    if (!window.ShortcutsManager) {
        console.error("ShortcutsManager library could not be loaded via @require.");
        return;
    }

    shortcuts.forEach(shortcut => {
        window.ShortcutsManager.register({
            id: shortcut.id,
            description: shortcut.description,
            callback: shortcut.callback,
            renderExtraInfo: shortcut.renderExtraInfo
        });
    });

    window.ShortcutsManager.init();
}


function voteSkip() {
    $('#qpInputVoteSkip').click();
}

function showSongList() {
    if (typeof songHistoryWindow !== 'undefined' && typeof songHistoryWindow.trigger === 'function') {
        songHistoryWindow.trigger();
    }
}

function showScriptsInfo() {
    const installedUserscriptsButton = document.getElementById('mpInstalled');
    installedUserscriptsButton.click();
}

function showSettingsListTab() {
    if (!$('#settingModal').is(':visible')) {
        $('#optionListSettings').click();
    }
    $('#smAnimeListTab').click();
}

function showShortcutsTab() {
    if (!$('#settingModal').is(':visible')) {
        $('#optionListSettings').click();
    }
    $('#smShortcutsTab').click();
}


function checkUserOnline() {
    if (!userName) {
        console.log("No user name configured for this shortcut.");
        return;
    }
    if (typeof socialTab !== 'undefined' && socialTab.chatBar && typeof socialTab.chatBar.startChat === 'function') {
        socialTab.chatBar.startChat(userName);
    } else {
        console.error("AMQ socialTab.chatBar API is not available.");
        return;
    }

    setTimeout(() => {
        let chatOpened = false;

        $('.chatBoxContainer').each(function() {
            const chatTargetName = $(this).find('.chatTopBar p').text().trim();
            
            if (chatTargetName.toLowerCase() === userName.toLowerCase()) {
                chatOpened = true;
                const $chatBox = $(this);
                const offlineLayer = $chatBox.find('.disableChatLayer.offlineLayer');

                if (offlineLayer.length && !offlineLayer.hasClass('invisible')) {
                    // User offline
                    $chatBox.find('.chatTopBar .playerProfile').click();

                    setTimeout(() => {
                        const amqAlertActive = $('.swal2-container').is(':visible');
                        if (amqAlertActive) {
                            // Warning in screen -> The user does not exist
                            // NOTE: The sweet alert content is actually not being updated, why? Anyway, the warning is clear enough so it should not be a problem
                            $('#swal2-title').text('User Not Found');
                            $('#swal2-html-container').text(`The player "${userName}" does not exist in AMQ.`);

                            $chatBox.find('.chatTopBar .glyphicon-remove').click();

                        } else {
                            // No warning in screen -> The user is offline
                            $chatBox.find('.chatTopBar .glyphicon-remove').click();
                            
                            Swal.fire({
                                title: 'Search result',
                                text: `${userName} is currently offline.`,
                                showConfirmButton: true,
                                confirmButtonColor: '#3085d6',
                                confirmButtonText: 'OK'
                            });
                        }
                    }, DELAY);

                } else {
                    // User online
                    $chatBox.find('.textAreaContainer textarea').focus();
                }
                return false;
            }
        });

        if (!chatOpened) {
            Swal.fire({
                title: 'Search result',
                text: `Could not open chat with "${userName}". Please try again.`,
                showConfirmButton: true,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
        }

    }, DELAY);
}

function addCheckUserOnlineExtraInfo(row) {
    const userSettingContainer = $('<div></div>').addClass('amq-shortcut-extra-container');

    const userInput = $('<input>')
        .attr('type', 'text')
        .attr('tabindex', '-1')
        .addClass('form-control text-center amq-shortcut-extra-input')
        .val(userName ?? '')
        .attr('placeholder', "None (Type a name...)");

    userInput.on('input', function() {
        const value = $(this).val().trim();

        if (value === '') {
            userName = null;
            localStorage.removeItem('AMQ_Shortcut_UserName');
        } else {
            userName = value;
            localStorage.setItem('AMQ_Shortcut_UserName', value);
        }
    });

    userSettingContainer.append(userInput);
    row.append(userSettingContainer);
}