// ==UserScript==
// @name         AMQ Song Info Downloader
// @namespace    https://github.com/JabroAMQ/
// @version      0.5.1
// @description  Download some info from the songs that played while playing AMQ
// @author       Jabro, Spitzell
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/joske2865/AMQ-Scripts/master/common/amqScriptInfo.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.user.js
// ==/UserScript==


const VERSION = '0.5.1';
const DELAY = 500;
const DOMAINS = {
    'EU': 'https://nl.catbox.video/',
    'NA1': 'https://ladist1.catbox.video/',
    'NA2': 'https://vhdist1.catbox.video/'
};

let selectedDomain;
let autoDownloadOnQuizOver;
let clearSongsInfoOnNewQuiz;
let quizReadyListener;
let quizOverListener;
let allSongs = [];


if (document.getElementById('loginPage'))
    return;

let loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        loadUserConfig();
        addDownloaderListeners();
        addDownloaderSettingsTab();
        createDownloadButton();
    }
}, DELAY);


class SongInfo {

    constructor(result) {
        const newSong = result.songInfo;
        this.animeName = newSong.animeNames.romaji.replaceAll(',', '');
        this.songName = newSong.songName.replaceAll(',', '');
        this.songArtist = newSong.artist;
        this.songType = newSong.type === 1 ? 'OP' : (newSong.type === 2 ? 'ED' : 'IN');
        this.songType = newSong.typeNumber === 0 ? this.songType : `${this.songType} ${newSong.typeNumber}`;
        this.songUrlPath = newSong.videoTargetMap.catbox[0];
    }

    getSongInfo() {
        const songUrl = `${DOMAINS[selectedDomain]}${this.songUrlPath}`;
        return `${this.animeName},${this.songType},${songUrl},${this.songName},${this.songArtist}`;
    }
}


function addDownloaderListeners() {
    // Get song data on answer reveal
    new Listener('answer results', result => {
        const newSongInfo = new SongInfo(result)
        allSongs.push(newSongInfo);
    }).bindListener();

    // Download the songs once the quiz is over
    quizOverListener = new Listener('quiz over', () => {
        downloadSongsInfo();
    });
    if (autoDownloadOnQuizOver)
        quizOverListener.bindListener();

    // Reset song list for the new round
    quizReadyListener = new Listener('quiz ready', () => {
        clearSongsInfo();
    });
    if (clearSongsInfoOnNewQuiz)
        quizReadyListener.bindListener();

    /* TODO?:
        - autoDownloadOnLeavingLobby (while playing game only)
        - autoDownloadOnKickedFromLobby
        - autoDownloadOnServerRestart
    */
}

function downloadSongsInfo() {
    // Make sure there are songs to avoid downloading an empty TXT file
    if (allSongs.length <= 0)
        return;

    const allSongsString = allSongs.map(song => song.getSongInfo()).join('\n');
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob([allSongsString], {type: 'text/plain'}));
    downloadLink.download = 'songsInfo.txt';
    downloadLink.click();
}

function clearSongsInfo() {
    // https://stackoverflow.com/a/1232046/20214407
    allSongs.length = 0;
}


function addDownloaderSettingsTab() {
    // Create the "Downloader" tab in settings
    $('#settingModal .tabContainer')
        .append($('<div></div>')
            .addClass('tab songInfoDownloader clickAble')
            .attr('onClick', "options.selectTab('settingsDownloaderContainer', this)")
            .append($('<h5></h5>')
                .text('Downloader')
            )
        );

    // Create the body base for "Downloader" tab
    const downloaderTabContent = $('<div></div>')
        .attr('id', 'settingsDownloaderContainer')
        .addClass('settingContentContainer hide');
    $('#settingModal .modal-body').append(downloaderTabContent);

    addDownloaderSettingsTabBodyContent();

    // Bind a click event listener to resize the settings modal width.
    // We can't change its width directly as we want it to dynamically
    // adjust to the modal-tab width, and we can't get it while the modal is hidden
    $('#settingModal').on('shown.bs.modal', function () {
        const modalContent = $('#settingModal .modal-dialog');
        const modalTab = $('#settingModal .tabContainer');
        const desiredWidth = `${modalTab.width()}px`;
        modalContent.css('width', desiredWidth);
    });

    // Bind a click event listener to show the content of the "Downloader" tab when clicked
    $('#settingModal .tabContainer').on('click', '.songInfoDownloader', function () {
        downloaderTabContent.removeClass('hide');
    });

    // Bind a click event listener to hide the downloader tab when another tab is clicked
    $('#settingModal .tabContainer').on('click', '.tab:not(.songInfoDownloader)', function () {
        if (!downloaderTabContent.hasClass('hide')) {
            downloaderTabContent.addClass('hide');

            // Manually unselect the "Downloader" tab and select the one that was clicked (doesn't work well by default)
            $('#settingModal .tabContainer .tab').removeClass('selected');
            $(this).addClass('selected');
        }
    });
}

function addDownloaderSettingsTabBodyContent() {
    // Create the main container for the "Downloader" tab body
    const mainContainer = document.createElement('div');
    mainContainer.id = 'mainDownloaderContainer';
    document.getElementById('settingsDownloaderContainer').appendChild(mainContainer);

    // Create and append the selectbox container
    const selectboxContainer = document.createElement('div');
    selectboxContainer.id = 'selectboxContainer';
    mainContainer.appendChild(selectboxContainer);
    selectboxContainer.appendChild(createPreferredHostSelectBox());

    // Create and append the checkboxes container
    const checkBoxContainer = document.createElement('div');
    checkBoxContainer.id = 'checkBoxContainer';
    mainContainer.appendChild(checkBoxContainer);
    checkBoxContainer.appendChild(createCheckBox(autoDownloadOnQuizOver, quizOverListener, 'Autodownload on quiz end'));
    checkBoxContainer.appendChild(createCheckBox(clearSongsInfoOnNewQuiz, quizReadyListener, 'Reset songlist on quiz start'));
}

function createPreferredHostSelectBox() {
    // Create a content container for the select
    const container = document.createElement('div');
    container.className = 'downloaderSubContainer';

    // Create the select
    const select = document.createElement('select');
    select.className = 'downloaderSelect';
    select.value = selectedDomain;

    // Create the select's label
    const label = document.createElement('label');
    label.className = 'downloaderLabel';
    label.textContent = 'Change Prefered Host';

    // Add the options to the select
    const options = Object.keys(DOMAINS);
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.className = 'downloaderOption';
        optionElement.value = option;
        optionElement.text = option;
        optionElement.selected = option === selectedDomain;
        select.appendChild(optionElement);
    });

    // Listen for changes
    select.addEventListener('change', function () {
        selectedDomain = this.value;
        saveUserConfig();
    });

    // Add the label and the select to the container, and return the container
    container.append(label, select);
    return container;   
}

function createCheckBox(currentValue, listener, labelText) {
    // Create a content container for the checkbox
    const container = document.createElement('div');
    container.className = 'downloaderSubContainer';

    // Create the checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'downloaderCheckbox';
    checkbox.checked = currentValue;

    // Create the checkbox's label
    const label = document.createElement('label');
    label.className = 'downloaderLabel';
    label.textContent = labelText;

    // Listen for changes
    checkbox.addEventListener('change', function() {
        const newValue = this.checked;
        newValue ? listener.bindListener() : listener.unbindListener();
    });

    // Add the label and the checkbox to the container, and return the container
    container.append(checkbox, label);
    return container;
}


function createDownloadButton() {
    const buttonWidth = 30;
    const buttonMarginRight = 5;

    const downloadButton = $(`
        <div id='downloadButton' class='clickAble qpOption'>
            <i aria-hidden='true' class='fa fa-download qpMenuItem'></i>
        </div>`)
        .css({
            width: `${buttonWidth}px`,
            height: '100%',
            'margin-right': `${buttonMarginRight}px`
        })
        .click(function () {
            downloadSongsInfo();
        })
        .popover({
			placement: 'bottom',
			content: 'Download Song Info',
			trigger: 'hover'
	    });

    const currentWidth = $('#qpOptionContainer').width();
    const extraWidth = buttonWidth + buttonMarginRight;
    $('#qpOptionContainer').width(currentWidth + extraWidth);
    $('#qpOptionContainer > div').append(downloadButton);
}


// Cookies stuff: https://stackoverflow.com/a/24103596/20214407
function loadUserConfig() {
    selectedDomain = getCookie('selectedDomain') || 'EU';
    autoDownloadOnQuizOver = getCookie('autoDownloadOnQuizOver') === 'true';
    clearSongsInfoOnNewQuiz = getCookie('clearSongsInfoOnNewQuiz') === 'true';
}

function saveUserConfig() {
    setCookie('selectedDomain', selectedDomain, 9999);
    setCookie('autoDownloadOnQuizOver', autoDownloadOnQuizOver, 9999);
    setCookie('clearSongsInfoOnNewQuiz', clearSongsInfoOnNewQuiz, 9999);
}

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


AMQ_addStyle(`
    #mainDownloaderContainer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
    }

    #selectboxContainer, #checkBoxContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 48%;
    }

    .downloaderSubContainer {
        margin-top: 15px;
        display: flex;
        align-items: center;
    }

    .downloaderSelect {
        margin-right: 10px;
        width: 60px;
        color: black;
    }
    
    .downloaderLabel {
        display: inline;
        font-size: 14px;
        margin-top: 10px;
        margin-left: 10px;
        margin-right: 10px;
    }

    .downloaderOption {
        color: black;
    }

    .downloaderCheckbox {
        margin-right: 10px;
        width: 20px;
        height: 20px;
    }
`);



AMQ_addScriptData({
    name: 'AMQ Song Info Downloader',
    author: 'Jabro & Spitzell',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.user.js',
    version: VERSION,
    description: `
        <p>Allow the player to download a TXT file with some info about the songs that played.</p>
        <p>You can download the TXT file at any point during the game:</p>
        <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/SongsDownloader/images/download_button.png' alt='DownloadButton'>
        <p>You can also modify how the script behaves:</p>
        <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/SongsDownloader/images/configuration.png' alt='ConfigurationOptions'>
    `
});