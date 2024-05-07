// ==UserScript==
// @name         AMQ Cancer Removal
// @namespace    https://github.com/JabroAMQ/
// @version      0.4
// @description  Check for unpleasant lobby's modifiers values and change them if proceeds
// @author       Jabro
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQCancerRemoval.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQCancerRemoval.user.js
// ==/UserScript==


// Do not load the script in the login page
if (document.getElementById('loginPage'))
    return;


const VERSION = '0.4';          // Documentation purposes only. Its value should match with the @version one from the userscript header
const DELAY = 500;              // Manual delay among functions (in milliseconds) to ensure instructions are executed in a fashion order

let ignoreScript;               // Whether this script should be ignored when modifying the lobby settings
loadConfig();                   // Load cookies to retrieve persistent variable values


class Modifier {
    constructor(checkboxSelector, value) {
        this.checkbox = $(checkboxSelector);
        this.value = value;
    }

    cancerDetected(currentValue) {
        switch (this.value) {
            case Modifiers.ON:
                return !currentValue;
            case Modifiers.OFF:
                return currentValue;
            default:
                return false;
        }
    }

    removeCancer() {
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
        this.modifiers = modifiers.map(modifier => new Modifier(modifier.checkboxSelector, modifier.value));
    }

    ensureNotCancer(currentValues) {
        let cancerFound = false;
        this.modifiers.forEach((modifier, index) => {
            if (modifier.cancerDetected(currentValues[index])) {
                modifier.removeCancer();
                cancerFound = true;
            }
        });
        return cancerFound;
    }
}

const modifiers = new Modifiers([
    /*
    Possible modifiers values:
    - ON: Ensure the modifier is set to true (and set it to true if not)
    - OFF: Ensure the modifier is set to false (and set it to false if not)
    - IGNORE: Does not modify the value of the modifiers (keep it as true if it's set to true and keep it as false if it's set to false)
    */
    { checkboxSelector: '#mhGuessSkipping', value: Modifiers.ON },          // Skip Guessing
    { checkboxSelector: '#mhReplaySkipping', value: Modifiers.ON },         // Skip Results
    { checkboxSelector: '#mhQueueing', value: Modifiers.IGNORE },           // Queueing
    { checkboxSelector: '#mhDuplicateShows', value: Modifiers.IGNORE },     // Duplicate Shows
    { checkboxSelector: '#mhRebroadcastSongs', value: Modifiers.OFF },      // Rebroadcast Songs
    { checkboxSelector: '#mhDubSongs', value: Modifiers.OFF },              // Dub Songs
    { checkboxSelector: '#mhFullSongRange', value: Modifiers.OFF }          // Full Song Range
]);


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
    var chatInput = document.getElementById('gcInput');
    chatInput.value = content;
    var enterEvent = new KeyboardEvent('keypress', { key: 'Enter', keyCode: 13 });
    chatInput.dispatchEvent(enterEvent);
}

function checkSettings() {
    if (ignoreScript)
        return;

    setTimeout(() => {
        const currentValues = getLobbyModifiersValues();
        let cancer_detected = modifiers.ensureNotCancer(currentValues);
        
        if (cancer_detected) {
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


// Modified behavour of the "Host Lobby" button
// NOTE: ideally rather than modifying the onclick behavour, we should add an event listener to add the additional behavour
$('#mhHostButton').removeAttr('onclick');
$('#mhHostButton').click(() => {
    roomBrowser.host();             // Original "onclick" behavour
    checkSettings();                // Added behavour
});

// Modified behavour of the "Change Lobby Settings" button
// NOTE: ideally rather than modifying the onclick behavour, we should add an event listener to add the additional behavour
$('#mhChangeButton').removeAttr('onclick');
$('#mhChangeButton').click(() => {
    lobby.changeGameSettings();     // Original "onclick" behavour
    checkSettings();                // Added behavour
});

// Added behavour when being promoted to host while in lobby
new Listener('Host Promotion', (payload) => {
	var newHost = payload.newHost;
    if (newHost === selfName && lobby.inLobby)
        checkSettings();
}).bindListener();


// UI Stuff:
// Create a button to allow the user to ignore this script when clicked
var ignoreButton = document.createElement('button');
ignoreButton.type = 'button';
ignoreButton.className = ignoreScript ? 'btn btn-default' : 'btn btn-primary';
ignoreButton.id = 'mhCancerButton'
ignoreButton.innerHTML = '♋';

// Add the desired functionallity to the button
ignoreButton.addEventListener('click', function() {
    // Modify the value of ignoreScript and save it as cookie to remember it in future sessions
    ignoreScript = !ignoreScript;
    saveConfig();

    // Modify the cancer button class and the text of the modal based on the value of ignoreScript var
    ignoreButton.className = ignoreScript ? 'btn btn-default' : 'btn btn-primary';
    var modalText = ignoreScript
        ? 'The script has now been disabled. The lobby\'s modifiers won\'t be checked by the script anymore.'
        : 'The script has now been enabled. The lobby\'s modifiers will now be modified by the script if proceeds.';

    // Send a "debug" modal to inform the user that the change was applied
    Swal.fire({
        title: 'AMQ Cancer Removal Script',
        text: modalText,
        showConfirmButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
});

// Insert the button in the settings container's footer
var modalFooter = document.querySelector('#mhHostSettingContainer .modal-footer');
var mainButton = modalFooter.querySelector('.btn-primary');
modalFooter.insertBefore(ignoreButton, mainButton);


// Cookies stuff: https://stackoverflow.com/a/24103596/20214407
function getCookie(name) {
    let nameEQ = name + '=';
    let ca = document.cookie.split(';');
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
        let date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}

function loadConfig() {
    let ignoreScriptString = getCookie('ignoreScript');
    ignoreScript = ignoreScriptString === 'true';
}

function saveConfig() {
    let ignoreScriptString = ignoreScript.toString();
    setCookie('ignoreScript', ignoreScriptString, 9999);
}


AMQ_addScriptData({
    name: 'AMQ Cancer Removal',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/FasterLobbyCreation/AMQCancerRemoval.user.js',
    version: VERSION,
    description: `
        <div>
            <p>Automatically change some settings modifiers from the lobby. By default:</p>
            <ul>
                <li>- Turns off rebroadcast and dubs songs as well as full song range.</li>
                <li>- Turns on skip guessing and skip replay options.</li>
            </ul>
        </div>

        <div>
            <p>The changes are applied when:</p>
            <ul>
                <li>- The lobby is created.</li>
                <li>- The host (using this script) modifies the lobby settings.</li>
                <li>- The player (using this script) is promoted to host while in the lobby.</li>
            </ul>
        </div>

        <div>
            <p>You can turn off the script from the own game by clicking on the "Cancer" button found in the footer of the settings modal:</p>
            <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/FasterLobbyCreation/images/CancerRemoval/cancer_button.png' alt='Cancer Button'>

            <p>You can also modify which modifiers should be turned on/off in the code of the script (const modifiers values)</p>
        </div>
    `
});