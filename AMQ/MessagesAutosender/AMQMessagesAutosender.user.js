// ==UserScript==
// @name         AMQ Messages Autosender
// @namespace    https://github.com/JabroAMQ/
// @version      0.4.1
// @description  Allow the user to store some messages and autosend them when clicked
// @author       Jabro
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqWindows.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/MessagesAutosender/AMQMessagesAutosender.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/MessagesAutosender/AMQMessagesAutosender.user.js
// ==/UserScript==

const VERSION = '0.4.1';
const DELAY = 500;
const MAX_MESSAGE_LENGTH = 150;
let savedMessagesWindow;
let savedMessages = [];


if (document.getElementById('loginPage'))
    return;

let loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        loadMessages();
        createSavedMessagesWindow();
        createSavedMessagesWindowButton();
        addSavedMessagesWindowToOptionsContainer();
    }
}, DELAY);


function createSavedMessagesWindow() {
    savedMessagesWindow = new AMQWindow({
        title: 'Saved Messages',
        position: { x: 0, y: 34 },
        width: 400,
        height: 374,
        zIndex: 1010,
        resizable: true,
        draggable: true
    });

    addNewMessagePanel();
    addSavedMessagesPanel();
}

function addNewMessagePanel() {
    // Create the "New Message" panel
    savedMessagesWindow.addPanel({
        id: 'addNewMessagePanel',
        width: 1,
        height: 0.2,
        scrollable: { x: true, y: false }
    });

    // Add a panel-separator to the "New Message" panel
    const separator = document.createElement('div');
    separator.id = 'panelSeparator';
    const newMessagePanel = savedMessagesWindow.panels[0].panel
    newMessagePanel.append(separator);

    // Create a content container for the "New Message" panel
    const container = document.createElement('div');
    container.id = 'newMessageContainer';

    // Create a text input and add it to the "New Message" container
    const messageInput = document.createElement('input');
    messageInput.id = 'newMessageTextField';
    messageInput.type = 'text';
    messageInput.placeholder = 'Write a message here...';
    container.appendChild(messageInput);

    // Create the "Save" button and add it to the "New Message" container
    const saveButton = document.createElement('button');
    saveButton.id = 'newMessageSaveButton';
    saveButton.innerHTML = 'Save';
    saveButton.onclick = saveMessage;
    container.appendChild(saveButton);

    // Add the container to the "New Message" panel as well as another panel-separator
    newMessagePanel.append(container);
    newMessagePanel.append(separator);
}

function addSavedMessagesPanel() {
    savedMessagesWindow.addPanel({
        id: 'savedMessagesPanel',
        width: 1,
        height: 0.8,
        scrollable: { x: true, y: true },
        position: { x: 0, y: 0.2 }
    });

    for (let message of savedMessages)
        addMessageContainerToPanel(message);
}

function addMessageContainerToPanel(textFieldValue) {    
    if (textFieldValue.length <= 0)
        return;

    // Cut the string if its lenght is greater than AMQ's max message length value
    if (textFieldValue.length > MAX_MESSAGE_LENGTH)
        textFieldValue = textFieldValue.substring(0, MAX_MESSAGE_LENGTH);
    
    // Create a content container for the saved message
    const container = document.createElement('div');
    container.id = 'savedMessageContainer';

    // Display the saved message as a button and add it to the container
    const savedMessage = document.createElement('button');
    savedMessage.id = 'savedMessage';
    savedMessage.innerHTML = textFieldValue;
    savedMessage.title = textFieldValue;
    savedMessage.onclick = function() {
        sendMessage(textFieldValue);
    };
    container.appendChild(savedMessage);

    // Create a delete button to remove the saved message and add it to the container
    const deleteButton = document.createElement('button');
    deleteButton.id = 'deleteSavedMessageButton';
    deleteButton.innerHTML = 'Delete';
    deleteButton.onclick = function (event) {
        event.stopPropagation();
        deleteMessage(container, textFieldValue);
    };
    container.appendChild(deleteButton);    

    // Append the container to the 'savedMessagesPanel' panel
    const savedMessagesPanel = savedMessagesWindow.panels[1].panel
    savedMessagesPanel.append(container);
}


function saveMessage() {
    let textFieldValue = document.getElementById('newMessageTextField').value;
    textFieldValue = translateShortcodeToUnicode(textFieldValue).text;          // emojis
    addMessageContainerToPanel(textFieldValue);

    // Log the changes for future sessions
    savedMessages.push(textFieldValue);
    storeMessages();
}

function deleteMessage(container, textFieldValue) {
    // Remove the container from the panel
    container.parentNode.removeChild(container)

    // Log the changes for future sessions
    let index = savedMessages.indexOf(textFieldValue);
    savedMessages.splice(index, 1);
    storeMessages();
}

function sendMessage(content) {
    let gameChatPage = document.getElementById('gameChatPage');
    if (!gameChatPage || gameChatPage.classList.contains('hidden')) {
        showErrorModal();
        return; 
    }

    let chatInput = document.getElementById('gcInput');
    chatInput.value = content;
    let enterEvent = new KeyboardEvent('keypress', { key: 'Enter', keyCode: 13 });
    chatInput.dispatchEvent(enterEvent);
}

function showErrorModal() {
    Swal.fire({
        title: 'Unable to send the message',
        text: 'You can\'t send a message if you are not in a lobby.',
        showConfirmButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
}


function createSavedMessagesWindowButton() {
    const buttonWidth = 30;
    const buttonMarginRight = 5;

    const savedMessagesWindowButton = $(`
        <div id='savedMessagesWindowButton' class='clickAble qpOption'>
            <i aria-hidden='true' class='fa fa-comments qpMenuItem'></i>
        </div>`)
        .css({
            width: `${buttonWidth}px`,
            height: '100%',
            'margin-right': `${buttonMarginRight}px`
        })
        .click(openSavedMessagesWindow)
        .popover({
			placement: 'bottom',
			content: 'Saved Messages',
			trigger: 'hover'
	    });

    const currentWidth = $('#qpOptionContainer').width();
    const extraWidth = buttonWidth + buttonMarginRight;
    $('#qpOptionContainer').width(currentWidth + extraWidth);
    $('#qpOptionContainer > div').append(savedMessagesWindowButton);
}

function addSavedMessagesWindowToOptionsContainer() {
    const optionsContainer = document.getElementById('optionsContainer');
    
    // Add a new list item to the optionsContainer
    const savedMessagesOption = document.createElement('li');
    savedMessagesOption.className = 'clickAble';
    savedMessagesOption.textContent = 'Saved Messages';
    savedMessagesOption.onclick = openSavedMessagesWindow;

    // Insert the new list item after the "Installed Userscripts" one
    const installedUserscriptsLi = optionsContainer.querySelector('ul [data-target="#installedModal"]');
    installedUserscriptsLi.parentNode.insertBefore(savedMessagesOption, installedUserscriptsLi.nextSibling);
}

function openSavedMessagesWindow() {
    savedMessagesWindow.isVisible() ? savedMessagesWindow.close() : savedMessagesWindow.open();
}


// Cookies stuff: https://stackoverflow.com/a/24103596/20214407
function loadMessages() {
    const savedMessagesString = getCookie('savedMessages');
    if (savedMessagesString)
        savedMessages = JSON.parse(savedMessagesString);
}

function storeMessages() {
    const messagesString = JSON.stringify(savedMessages);
    setCookie('savedMessages', messagesString, 9999);
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
    /* "New Message" panel */
    #newMessageContainer {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 90%;
    }

    #newMessageTextField {
        color: black;
        width: 75%;
        height: 65%;
        margin-left: 5%;
        margin-right: 5%;
    }

    #newMessageSaveButton {
        color: black;
        width: 15%;
        height: 65%;
        margin-right: 5%;
    }


    /* Panel separator */
    #panelSeparator {
        width: 100%;
        height: 2px;
        background-color: black;
    }

    
    /* "Saved Message" panel */
    #savedMessageContainer {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 10%;
    }

    #savedMessage {
        color: black;
        width: 75%;
        margin-left: 5%;
        margin-right: 5%;
        overflow: hidden;
        text-overflow: ellipsis;
        background-color: white;
    }

    #deleteSavedMessageButton {
        color: black;
        width: 15%;
        margin-right: 5%;
    }

`);


AMQ_addScriptData({
    name: 'AMQ Messages Autosender',
    author: 'Jabro',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/MessagesAutosender/AMQMessagesAutosender.user.js',
    version: VERSION,
    description: `
        <p>Allow the player to save custom messages and, once they are clicked, autosend them to game chat</p>
        <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/MessagesAutosender/images/ExampleGIF.gif' alt='ExampleGIF'>
        <p>You can open the window from an in-game button:</p>
        <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/MessagesAutosender/images/OpenButton.png' alt='OpenButton'>
        <p>Or from the options container:</p>
        <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/MessagesAutosender/images/OptionsContainer.png' alt='OptionsContainer'>
    `
});