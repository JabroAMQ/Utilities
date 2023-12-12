// ==UserScript==
// @name         AMQ Song Info Downloader
// @namespace    https://github.com/JabroAMQ/
// @version      0.2
// @description  Download some info from the songs that played while playing AMQ
// @author       Spitzell, Jabro
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @downloadURL  https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.user.js
// @updateURL    https://github.com/JabroAMQ/Utilities/blob/main/AMQ/SongsDownloader/AMQSongInfoDownloader.user.js
// ==/UserScript==


// SET YOUR PREFERRED HOST
// EU:  'https://nl.catbox.video/'
// NA1: 'https://ladst1.catbox.video/'
// NA2: 'https://abdist1.catbox.video/'
const DOMAIN = 'https://nl.catbox.video/';


// MODIFY THE NEXT VALUES IF YOU WANT TO
// Whether songs info is reseted when a new quiz starts (avoid downloading songs info from previous rounds)
const CLEAR_SONGS_INFO_ON_NEW_QUIZ = false  // songs info will always clear if closing/refreshing the AMQ browser tab
// Whether songs info is downloaded automatically each time a quiz ends by reaching the last song
const ALWAYS_DOWNLOAD_ON_QUIZ_OVER = false
// Whether songs info is downloaded automatically each time a quiz ends by a successfull returning to lobby vote
// TODO const ALWAYS_DOWNLOAD_ON_RETURNING_TO_LOBBY = false
// Whether songs info is downloaded automatically when you manually leaves the lobby
// TODO const ALWAYS_DOWNLOAD_ON_LEAVING_LOBBY = false
// Whether songs info is downloaded automatically when you are kicked from the lobby
// TODO const ALWAYS_DOWNLOAD_WHEN_BEING_KICKED = false
// Whether songs info is downloaded automatically during a server restart
// TODO const ALWAYS_DOWNLOAD_WHEN_SERVER_RESTART = false


// DO NOT MODIFY ANYTHING FROM HERE
const CHECK_INTERVAL = 500;
let allSongs = ''

// Load the script once the game has started
let loadInterval = setInterval(() => {
    let loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && loadingScreen.classList.contains('hidden')) {
        setup();
        clearInterval(loadInterval);
    }
}, CHECK_INTERVAL);

function setup() {
    setupDownloadButton();
    setupListeners();
}


function setupDownloadButton() {
    let downloadButtonWidth = 30;
    let downloadButtonMarginRight = 5;

    let downloadButton = $(`
        <div id='downloadButton' class='clickAble qpOption'>
            <i aria-hidden='true' class='fa fa-download qpMenuItem'></i>
        </div>`)
        .css({
            width: `${downloadButtonWidth}px`,
            height: '100%',
            'margin-right': `${downloadButtonMarginRight}px`
        })
        .click(function () {
            downloadSongsInfo();
        })
        .popover({
			placement: 'bottom',
			content: 'Download Song Info',
			trigger: 'hover'
	    });

    // '#qpOptionContainer' is the in-game container where you can check song list, settings, modify volume, etc.
    // We simply add our button at the last (left) position of this container (only visible when a game is active)
    let currentWidth = $('#qpOptionContainer').width();
    let extraWidth = downloadButtonWidth + downloadButtonMarginRight;
    $('#qpOptionContainer').width(currentWidth + extraWidth);
    $('#qpOptionContainer > div').append(downloadButton);
}


function setupListeners() {
    // Listeners always active (configuration non-dependent)
    // Get song data on answer reveal
    let answerResultsListener = new Listener('answer results', (result) => {
        allSongs += getSongInfo(result);
    });
    answerResultsListener.bindListener();

    // Listeners active only depending on set configuration
    if (CLEAR_SONGS_INFO_ON_NEW_QUIZ) {
        // Reset song list for the new round
        let quizReadyListener = new Listener('quiz ready', (_) => {
            clearSongsInfo();
        });
        quizReadyListener.bindListener();
    }
    if (ALWAYS_DOWNLOAD_ON_QUIZ_OVER) {
        // Download the songs once the quiz is over
        let quizOverListener = new Listener('quiz over', (_) => {
            downloadSongsInfo();
        });
        quizOverListener.bindListener();
    }
}


function getSongInfo(result) {
    let newSong = result.songInfo;
    let songUrl = `${DOMAIN}${newSong.videoTargetMap.catbox[0]}`;
    let animeName = newSong.animeNames.romaji.replaceAll(',', '');
    let songName = newSong.songName.replaceAll(',', '');
    let songArtist = newSong.artist;
    let songType = newSong.type === 1 ? 'OP' : (newSong.type === 2 ? 'ED' : 'IN');
    songType = newSong.typeNumber === 0 ? songType : `${songType} ${newSong.typeNumber}`;
    let songInfo = `${animeName},${songType},${songUrl},${songName},${songArtist}\n`;
    return songInfo;
}

function downloadSongsInfo() {
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob([allSongs], {type: 'text/plain'}));
    downloadLink.download = 'songsInfo.txt';
    downloadLink.click();
}

function clearSongsInfo() {
    allSongs = '';
}