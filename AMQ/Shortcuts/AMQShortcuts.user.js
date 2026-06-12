// ==UserScript==
// @name         AMQ Shortcuts
// @namespace    https://github.com/JabroAMQ/
// @version      1.0.1
// @description  Some shortcuts to improve the game experience
// @author       Jabro
// @match        https://*.animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/Shortcuts/AMQShortcutsCore.js
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/Shortcuts/AMQShortcuts.user.js
// @updateURL    https://raw.githubusercontent.com/JabroAMQ/Utilities/main/AMQ/Shortcuts/AMQShortcuts.user.js
// ==/UserScript==

const VERSION = '1.0.1';
const DELAY = 300;

const descriptions = {
    voteSkip: 'Vote to skip the current song',
    focusAnswerInput: 'Select the answer box input',
    focusChatInput: 'Select the lobby chat box input',
    showSongList: 'Open/Close the song list',
    showScriptsInfo: 'Open/Close Joseph\'s "Installed Userscripts" modal',
    showSettingsListTab: 'Open the Anime List tab from the Settings modal',
    showShortcutsTab: 'Open the Shortcuts tab from the Settings modal',
    checkUserOnline: 'Check if the user (name below) is online, opening their dm if so',
};

const shortcuts = [
    { id: 'voteSkip', callback: voteSkip, description: descriptions.voteSkip },
    { id: 'focusAnswerInput', callback: focusAnswerInput, description: descriptions.focusAnswerInput },
    { id: 'focusChatInput', callback: focusChatInput, description: descriptions.focusChatInput},
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

function focusAnswerInput() {
    if (typeof quiz !== 'undefined' && quiz.answerInput && quiz.answerInput.typingInput) {
        const $input = quiz.answerInput.typingInput.$input;

        // Make sure we are not in "Multiple Choice" mode...
        if ($input && $input.is(':visible')) {
            quiz.answerInput.typingInput.$input.focus()

            // We could also select the current input to delete it, but we can do this using `Ctrl + A` (default "shortcut") right after calling focusAnswerInput()
            // quiz.answerInput.typingInput.$input.select()
        }
    } else {
        console.log("Quiz answer input is not available right now. Make sure you are in a quiz round.");
    }
}

function focusChatInput() {
    if (typeof gameChat !== 'undefined' && gameChat.$chatInputField) {
        gameChat.$chatInputField.focus()
    } else {
        console.log("Lobby chat input is not available right now.");
    }
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

AMQ_addScriptData({
    name: 'Shortcuts',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/Shortcuts/AMQShortcuts.user.js',
    version: VERSION,
    description: `
        <div style="max-width: 500px; line-height: 1.4;">
            <p>A customizable keyboard shortcuts userscript to streamline your gameplay, chat, and navigation.</p>
            <p>You can bind your own custom <code>Ctrl + Key</code> combinations directly within the new Shortcuts tab inside the Settings modal.</p>
            <img src="https://github.com/JabroAMQ/Utilities/raw/main/AMQ/Shortcuts/images/shortcutsTab.png" alt="Shortcuts tab" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px;" />
        </div>

        <div style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px;">
            <ul style="padding-left: 20px; margin: 5px 0;">
                <li>You cannot bind the same key to two different actions (the game will alert you).</li>
                <li>You can unbind any key by pressing the <code>Backspace</code> or <code>Delete</code> keys.</li>
            </ul>
            <p style="margin-top: 10px;">
                💡 Check out the <a href="https://github.com/JabroAMQ/Utilities/blob/main/AMQ/Shortcuts/SHORTCUTS.md" target="_blank" rel="noopener noreferrer" style="color: #61afef; text-decoration: underline;">recommended key setups</a>.
            </p>
        </div>
    `
});