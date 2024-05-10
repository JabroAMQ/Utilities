// ==UserScript==
// @name         AMQ Auto Modifiers
// @namespace    https://github.com/JabroAMQ/
// @version      0.6
// @description  Check for unpleasant lobby's modifiers values and change them if proceeds
// @author       Jabro
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQAutoModifiers.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQAutoModifiers.user.js
// ==/UserScript==


const VERSION = '0.6';          // Documentation purposes only. Its value should match with the @version one from the userscript header
const DELAY = 500;              // Manual delay among functions (in milliseconds) to ensure instructions are executed in a fashion order
let ignoreScript;               // Whether this script should be ignored when modifying the lobby settings
let modifiers;                  // The values of the modifiers to be checked


// Do not load the script in the login page
if (document.getElementById('loginPage'))
    return;

// Wait until the LOADING... screen is hidden and load script
const loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        loadConfig();
        addModifiersListeners();
        addModifiersSettingsTab();
    }
}, DELAY);


class Modifier {
    constructor(name, checkboxId, value) {
        this.name = name;
        this.checkbox = $(checkboxId);
        this.value = value;
    }

    isUnpleasant(currentValue) {
        switch (this.value) {
            case Modifiers.ON:
                return !currentValue;
            case Modifiers.OFF:
                return currentValue;
            default:
                return false;
        }
    }

    changeValue() {
        switch (this.value) {
            case Modifiers.ON:
                this.checkbox.prop('checked', true);
                break;
            case Modifiers.OFF:
                this.checkbox.prop('checked', false);
                break;
            default:
                break;
        }
    }
}

class Modifiers {
    static ON = 'ON';
    static OFF = 'OFF';
    static IGNORE = 'IGNORE';

    constructor(modifiers) {
        this.modifiers = modifiers.map(modifier => new Modifier(modifier.name, modifier.checkboxId, modifier.value));
    }

    ensureNotUnpleasant(currentValues) {
        let unpleasantModifierFound = false;
        this.modifiers.forEach((modifier, index) => {
            if (modifier.isUnpleasant(currentValues[index])) {
                modifier.changeValue();
                unpleasantModifierFound = true;
            }
        });
        return unpleasantModifierFound;
    }
}


function addModifiersListeners() {
    addHostLobbyListener();         // TODO: create a proper event listener (which is the event name we have to listen to??)
    addChangeSettingsListener();    // TODO: create a proper event listener (which is the event name we have to listen to??)
    addHostPromotionListener();
}

function addHostLobbyListener() {
    // Modified behavour of the "Host Lobby" button
    // NOTE: ideally rather than modifying the onclick behavour, we should add an event listener to add the additional behavour
    $('#mhHostButton').removeAttr('onclick');
    $('#mhHostButton').click(() => {
        roomBrowser.host();             // Original "onclick" behavour
        checkSettings();                // Added behavour
    });
}

function addChangeSettingsListener() {
    // Modified behavour of the "Change Lobby Settings" button
    // NOTE: ideally rather than modifying the onclick behavour, we should add an event listener to add the additional behavour
    $('#mhChangeButton').removeAttr('onclick');
    $('#mhChangeButton').click(() => {
        lobby.changeGameSettings();     // Original "onclick" behavour
        checkSettings();                // Added behavour
    });
}

function addHostPromotionListener() {
    // Added behavour when being promoted to host while in lobby
    new Listener('Host Promotion', (payload) => {
        const newHost = payload.newHost;
        if (newHost === selfName && lobby.inLobby)
            checkSettings();
    }).bindListener();
}


function addModifiersSettingsTab() {
    // Create the "Modifiers" tab in settings
    $('#settingModal .tabContainer')
        .append($('<div></div>')
            .addClass('tab modifiers clickAble')
            .attr('onClick', "options.selectTab('modifiersContainer', this)")
            .append($('<h5></h5>')
                .text('Modifiers')
            )
        );

    // Create the body base for "Modifiers" tab
    const modifiersTabContent = $('<div></div>')
        .attr('id', 'modifiersContainer')
        .addClass('settingContentContainer hide');
    $('#settingModal .modal-body').append(modifiersTabContent);

    addModifiersSettingsTabBodyContent();

    // Bind a click event listener to resize the settings modal width.
    // We can't change its width directly as we want it to dynamically
    // adjust to the modal-tab width, and we can't get it while the modal is hidden
    $('#settingModal').on('shown.bs.modal', function () {
        const modalContent = $('#settingModal .modal-dialog');
        const modalTab = $('#settingModal .tabContainer');
        const desiredWidth = `${modalTab.width()}px`;
        modalContent.css('width', desiredWidth);
    });

    // Bind a click event listener to show the content of the "Modifiers" tab when clicked
    $('#settingModal .tabContainer').on('click', '.modifiers', function () {
        modifiersTabContent.removeClass('hide');
    });

    // Bind a click event listener to hide the "Modifiers" tab when another tab is clicked
    $('#settingModal .tabContainer').on('click', '.tab:not(.modifiers)', function () {
        if (!modifiersTabContent.hasClass('hide')) {
            modifiersTabContent.addClass('hide');

            // Manually unselect the "Modifiers" tab and select the one that was clicked (doesn't work well by default)
            $('#settingModal .tabContainer .tab').removeClass('selected');
            $(this).addClass('selected');
        }
    });
}

function addModifiersSettingsTabBodyContent() {
    const modifiersTabContent = $('#modifiersContainer');
    
    // Place the modifiers in groups of 3
    for (let i = 0; i < modifiers.modifiers.length; i += 3) {
        const row = $('<div>').addClass('modifierRow');

        for (let j = i; j < i + 3 && j < modifiers.modifiers.length; j++) {
            const modifier = modifiers.modifiers[j];
            const modifierContainer = $('<div>').addClass('modifierContainer');

            const label = $('<label>')
                .text(modifier.name)
                .addClass('modifierLabel');

            const selectBox = $('<select>')
                .addClass('modifierSelectBox')
                .attr('data-checkbox-selector', modifier.checkboxId)
                .on('change', function() {
                    const selectedValue = $(this).val();
                    switch (selectedValue) {
                        case 'ON':
                            modifier.value = Modifiers.ON;
                            break;
                        case 'OFF':
                            modifier.value = Modifiers.OFF;
                            break;
                        default:
                            modifier.value = Modifiers.IGNORE;
                            break;
                    }
                    saveConfig();
                });

            // Add options to the select box
            ['ON', 'OFF', 'IGNORE'].forEach(option => {
                const optionElement = $('<option>')
                    .text(option)
                    .attr('value', option);

                // Set the default selected option based on the current value of the modifier
                if (option.toUpperCase() === modifier.value) {
                    optionElement.prop('selected', true);
                }

                selectBox.append(optionElement);
            });

            modifierContainer.append(label, selectBox);
            row.append(modifierContainer);
        }
        modifiersTabContent.append(row);
    }
}


function checkSettings() {
    if (ignoreScript)
        return;

    setTimeout(() => {
        const currentValues = getLobbyModifiersValues();
        const unpleasantModifiers = modifiers.ensureNotUnpleasant(currentValues);

        if (unpleasantModifiers) {
            setTimeout(() => {
                sendChatMessage('**Script:** Unpleasant modifiers detected...');
                setTimeout(() => {
                    lobby.changeGameSettings();
                    setTimeout(() => {
                        sendChatMessage('**Script:** shiHib');
                    }, DELAY);
                }, DELAY);
            }, DELAY);
        }

    }, DELAY);
}

function getLobbyModifiersValues() {
    const currentValues = [
        lobby.settings.modifiers.skipGuessing,
        lobby.settings.modifiers.skipReplay,
        lobby.settings.modifiers.queueing,
        lobby.settings.modifiers.duplicates,
        lobby.settings.modifiers.rebroadcastSongs,
        lobby.settings.modifiers.dubSongs,
        lobby.settings.modifiers.fullSongRange
    ]
    return currentValues;
}

function sendChatMessage(content) {
    const chatInput = document.getElementById('gcInput');
    chatInput.value = content;
    const enterEvent = new KeyboardEvent('keypress', { key: 'Enter', keyCode: 13 });
    chatInput.dispatchEvent(enterEvent);
}


// Cookies stuff: https://stackoverflow.com/a/24103596/20214407
function loadConfig() {
    const ignoreScriptString = getCookie('Ignore Script');
    const skipGuessing = getCookie('Skip Guessing');
    const skipResults = getCookie('Skip Results');
    const queueing = getCookie('Queueing');
    const duplicateShows = getCookie('Duplicate Shows');
    const rebroadcastSongs = getCookie('Rebroadcast Songs');
    const dubSongs = getCookie('Dub Songs');
    const fullSongRange = getCookie('Full Song Range');

    /*
    Possible modifiers values:
    - ON: Ensure the modifier is set to true (and set it to true if not)
    - OFF: Ensure the modifier is set to false (and set it to false if not)
    - IGNORE: Does not modify the value of the modifiers (keep it as true if it's set to true and keep it as false if it's set to false)
    */
    const skipGuessingValue = skipGuessing == 'ON' ? Modifiers.ON
                            : skipGuessing == 'OFF' ? Modifiers.OFF
                            : Modifiers.IGNORE;
    const skipResultsValue = skipResults == 'ON' ? Modifiers.ON
                            : skipResults == 'OFF' ? Modifiers.OFF
                            : Modifiers.IGNORE;
    const queueingValue = queueing == 'ON' ? Modifiers.ON
                            : queueing == 'OFF' ? Modifiers.OFF
                            : Modifiers.IGNORE;
    const duplicateShowsValue = duplicateShows == 'ON' ? Modifiers.ON
                            : duplicateShows == 'OFF' ? Modifiers.OFF
                            : Modifiers.IGNORE;
    const rebroadcastSongsValue = rebroadcastSongs == 'ON' ? Modifiers.ON
                            : rebroadcastSongs == 'OFF' ? Modifiers.OFF
                            : Modifiers.IGNORE;
    const dubSongsValue = dubSongs == 'ON' ? Modifiers.ON
                            : dubSongs == 'OFF' ? Modifiers.OFF
                            : Modifiers.IGNORE;
    const fullSongRangeValue = fullSongRange == 'ON' ? Modifiers.ON
                            : fullSongRange == 'OFF' ? Modifiers.OFF
                            : Modifiers.IGNORE;

    ignoreScript = ignoreScriptString === 'true';
    modifiers = new Modifiers([
        { name: 'Skip Guessing', checkboxId: '#mhGuessSkipping', value: skipGuessingValue },
        { name: 'Skip Results', checkboxId: '#mhReplaySkipping', value: skipResultsValue },
        { name: 'Queueing', checkboxId: '#mhQueueing', value: queueingValue },
        { name: 'Duplicate Shows', checkboxId: '#mhDuplicateShows', value: duplicateShowsValue },
        { name: 'Rebroadcast Songs', checkboxId: '#mhRebroadcastSongs', value: rebroadcastSongsValue },
        { name: 'Dub Songs', checkboxId: '#mhDubSongs', value: dubSongsValue },
        { name: 'Full Song Range', checkboxId: '#mhFullSongRange', value: fullSongRangeValue }
    ]);
}

function saveConfig() {
    const ignoreScriptString = ignoreScript.toString();
    setCookie('Ignore Script', ignoreScriptString, 9999);

    modifiers.modifiers.forEach(modifier => {
        const modifierValue = modifier.value === Modifiers.ON ? 'ON'
                    : modifier.value === Modifiers.OFF ? 'OFF'
                    : 'IGNORE';
        setCookie(modifier.name, modifierValue, 9999);
    });
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}


AMQ_addStyle(`
    .modifiersContainer {
        margin-top: 10px;
    }

    .modifierRow {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .modifierContainer {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-top: 10px;
        margin-left: 45px;
    }

    .modifierSelectBox {
        width: 90px;
        padding: 5px;
        color: black;
    }

    .modifierLabel {
        font-weight: bold;
        text-align: left;
        margin-bottom: 10px;
    }
`);

AMQ_addScriptData({
    name: 'AMQ Auto Modifiers',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQAutoModifiers.user.js',
    version: VERSION,
    description: `
        <div>
            <p>Automatically look for unpleasant modifiers when hosting a lobby and change their values if needed:</p>
            <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/FasterLobbyCreation/images/AutoModifiers/example.png' alt='Example'
        </div>

        <div>
            <p>You can configure which modifiers are considered unpleasant from the game's main settings modal:</p>
            <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/FasterLobbyCreation/images/AutoModifiers/settings.png' alt='Settings'
        </div>

        <div>
            <p>The script change the values of the modifiers when:</p>
            <ul>
                <li>- The lobby is created.</li>
                <li>- The host (using this script) modifies the lobby settings.</li>
                <li>- The player (using this script) is promoted to host while in the lobby.</li>
            </ul>
        </div>
    `
});