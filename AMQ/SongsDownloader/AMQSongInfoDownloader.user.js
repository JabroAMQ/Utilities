// ==UserScript==
// @name         AMQ Song Info Downloader
// @namespace    https://github.com/JabroAMQ/
// @version      0.4.1
// @description  Download some info from the songs that played while playing AMQ
// @author       Jabro, Spitzell
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://github.com/joske2865/AMQ-Scripts/raw/master/common/amqScriptInfo.js
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.user.js
// ==/UserScript==

AMQ_addScriptData({
    name: 'AMQ Song Info Downloader',
    author: 'Jabro & Spitzell',
    link: 'https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.user.js',
    description: `
        <p>Allow the player to download a TXT file with some info about the songs that played.</p>
        <p>You can download the TXT file at any point during the game:</p>
        <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/SongsDownloader/images/download_button.png' alt='DownloadButton'>
        <p>You can also modify how the script behaves:</p>
        <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/SongsDownloader/images/open_configuration.png' alt='OpeningConfiguration'>
        <img src='https://github.com/JabroAMQ/Utilities/raw/main/AMQ/SongsDownloader/images/configuration.png' alt='ConfigurationOptions'>
    `
});

/*
TODO LIST:
- Add more functionallity (event listeners), and add these new options to the Configuration Tab:
    - autoDownloasOnLeavingLobby (while playing game only)
    - autoDownloadOnKickedFromLobby
    - autoDownloadOnServerRestart

- Prettify Configuration Tab
*/

const DOMAINS = {
    'EU': 'https://nl.catbox.video/',
    'NA1': 'https://ladst1.catbox.video/',
    'NA2': 'https://abdist1.catbox.video/'
};

let quizReadyListener;
let quizOverListener;
let selectedDomain = 'EU';
let autoDownloadOnQuizOver = false;
let clearSongsInfoOnNewQuiz = false;
let allSongs = [];


// Do not load the script in the login page
if (document.getElementById('loginPage'))
    return;

// Wait until the LOADING... screen is hidden and load script
let loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        setup();
    }
}, 500);

function setup() {
    setupDownloadButton();
    setupListeners();
    addDownloaderSettingsTab();
}


////////////////////////////////////////////////////////////////////////////////
//////////////////////////  DOWNLOAD SONG INFO STUFF   /////////////////////////
////////////////////////////////////////////////////////////////////////////////

class SongInfo {

    constructor(result) {
        let newSong = result.songInfo;
        this.animeName = newSong.animeNames.romaji.replaceAll(',', '');
        this.songName = newSong.songName.replaceAll(',', '');
        this.songArtist = newSong.artist;
        this.songType = newSong.type === 1 ? 'OP' : (newSong.type === 2 ? 'ED' : 'IN');
        this.songType = newSong.typeNumber === 0 ? this.songType : `${this.songType} ${newSong.typeNumber}`;
        this.songUrlPath = newSong.videoTargetMap.catbox[0];
    }

    getSongInfo() {
        let songUrl = `${DOMAINS[selectedDomain]}${this.songUrlPath}`;
        return `${this.animeName},${this.songType},${songUrl},${this.songName},${this.songArtist}`;
    }

}


function setupDownloadButton() {
    const buttonWidth = 30;
    const buttonMarginRight = 5;

    let downloadButton = $(`
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

    let currentWidth = $('#qpOptionContainer').width();
    let extraWidth = buttonWidth + buttonMarginRight;
    $('#qpOptionContainer').width(currentWidth + extraWidth);
    $('#qpOptionContainer > div').append(downloadButton);
}


function setupListeners() {
    // Get song data on answer reveal
    let answerResultsListener = new Listener('answer results', result => {
        let newSongInfo = new SongInfo(result)
        allSongs.push(newSongInfo);
    });
    answerResultsListener.bindListener();

    // Reset song list for the new round
    quizReadyListener = new Listener('quiz ready', () => {
        clearSongsInfo();
    });
    if (clearSongsInfoOnNewQuiz)
        quizReadyListener.bindListener();

    // Download the songs once the quiz is over
    quizOverListener = new Listener('quiz over', () => {
        downloadSongsInfo();
    });
    if (autoDownloadOnQuizOver)
        quizOverListener.bindListener();
}

function updateClearSongsInfoOnNewQuizListener() {
    clearSongsInfoOnNewQuiz ? quizReadyListener.bindListener() : quizReadyListener.unbindListener();
}

function updateAutoDownloadOnQuizOverListener() {
    autoDownloadOnQuizOver ? quizOverListener.bindListener() : quizOverListener.unbindListener();
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


////////////////////////////////////////////////////////////////////////////////
//////////////////////////  CONFIGURATION TAB STUFF   //////////////////////////
////////////////////////////////////////////////////////////////////////////////

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
    let downloaderTabContent = $('<div></div>')
        .attr('id', 'settingsDownloaderContainer')
        .addClass('settingContentContainer hide');
    $('#settingModal .modal-body').append(downloaderTabContent);


    // Create the "Change Prefered Host" select box for "Downloader" tab
    addSelectBox('Change prefered host', Object.keys(DOMAINS), (value) => {
        selectedDomain = value;
        saveUserConfig();
    }, selectedDomain, 'settingsDownloaderContainer');

    // Create the "Autodownload on Quiz End" checkbox for "Downloader" tab
    addCheckBox('Autodownload on quiz end', (checked) => {
        autoDownloadOnQuizOver = checked;
        saveUserConfig();
        updateAutoDownloadOnQuizOverListener();
    }, autoDownloadOnQuizOver, 'settingsDownloaderContainer');

    // Create the "Reset Songlist on Quiz Start" checkbox for "Downloader" tab
    addCheckBox('Reset songlist on quiz start', (checked) => {
        clearSongsInfoOnNewQuiz = checked;
        saveUserConfig();
        updateClearSongsInfoOnNewQuizListener();
    }, clearSongsInfoOnNewQuiz, 'settingsDownloaderContainer');


    // Bind a click event listener to resize the settings modal width.
    // We can't change its width directly as we want it to dynamically
    // adjust to the modal-tab width, and we can't get it while the modal is hidden
    $('#settingModal').on('shown.bs.modal', function () {
        adjustModalWidth();
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


function addSelectBox(label, options, onChangeCallback, defaultValue, containerId) {
    let id = label.replace(/\s/g, '');

    let selectContainer = $('<div>')
        .css({
            'margin-top': '15px',
            'margin-bottom': '20px',
            'margin-left': '15px',
            'display': 'flex',
            'align-items': 'center'
        });

    let select = $('<select>')
        .attr('id', id)
        .css({
            'margin-right': '10px',
            'width': '70px',
            'color': 'black',
        })
        .val(defaultValue);

    options.forEach(option => {
        let optionElement = $('<option>').text(option)
            .attr('value', option)
            .css({
                'color': 'black'
            });

        if (option === defaultValue)
            optionElement.attr('selected', 'selected');
        select.append(optionElement);
    });

    select.on('change', function () {
        onChangeCallback($(this).val());
    });

    let selectLabel = $(`<label for='${id}'>${label}</label>`)
        .css({
            'font-size': '14px',
            'margin-right': '10px'
        });

    selectContainer.append(selectLabel, select);
    $('#' + containerId).append(selectContainer);
}

function addCheckBox(label, onChangeCallback, defaultValue, containerId) {
    let id = label.replace(/\s/g, '');

    let checkboxContainer = $('<div>')
        .css({
            'margin-top': '15px',
            'margin-left': '15px',
            'display': 'flex',
            'align-items': 'bottom'
        });

    let checkbox = $(`<input type='checkbox' id='${id}' name='${id}'>`)
        .css({
            'margin-right': '10px',
            'width': '20px',
            'height': '20px'
        })
        .prop('checked', defaultValue);

    checkbox.on('change', function () {
        onChangeCallback($(this).prop('checked'));
    });

    let checkboxLabel = $(`<label for='${id}'>${label}</label>`)
        .css({
            'font-size': '14px'
        });

    checkboxContainer.append(checkbox, checkboxLabel);
    $('#' + containerId).append(checkboxContainer);
}


function adjustModalWidth() {
    // Modify the overall settings modal's width dimension so that the added tab doesn't exceed it
    let modalContent = $('#settingModal .modal-dialog');
    let modalTab = $('#settingModal .tabContainer');
    let desiredWidth = `${modalTab.width()}px`;
    modalContent.css('width', desiredWidth);
}


///////////////////////////////////////////////////////////////////
//////////////////////////  COOKIES STUFF   ///////////////////////
///////////////////////////////////////////////////////////////////

// https://stackoverflow.com/a/24103596/20214407
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


function loadUserConfig() {
    selectedDomain = getCookie('selectedDomain') || selectedDomain;
    autoDownloadOnQuizOver = getCookie('autoDownloadOnQuizOver') === 'true';
    clearSongsInfoOnNewQuiz = getCookie('clearSongsInfoOnNewQuiz') === 'true';
}

function saveUserConfig() {
    setCookie('selectedDomain', selectedDomain, 9999);
    setCookie('autoDownloadOnQuizOver', autoDownloadOnQuizOver, 9999);
    setCookie('clearSongsInfoOnNewQuiz', clearSongsInfoOnNewQuiz, 9999);
}