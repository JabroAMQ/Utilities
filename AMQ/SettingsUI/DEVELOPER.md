# How to create custom tabs in AMQ Settings

You can reference `AMQSettingsUI.js` to create a new tab in the Settings modal without duplicating objects.

## For userscripts

```javascript
// ==UserScript==
// @name         My Custom AMQ Tab UI
// @version      0.1
// @description  Adds a custom tab to AMQ settings
// @author       You
// @match        https://*.animemusicquiz.com/*
// @grant        none
// @require      https://githubusercontent.com
// ==/UserScript==

// Typical AMQ userscript initialization
if (document.getElementById('loginPage')) return;
const DELAY = 300;
const loadInterval = setInterval(() => {
    if ($('#loadingScreen').hasClass('hidden')) {
        clearInterval(loadInterval);
        addCustomSettingsTab();
    }
}, DELAY);

// New tab UI
function addCustomSettingsTab() {
    window.AMQ_SettingsUI.createNewSettingsTab({
        tabId: 'smCustomTab',
        containerId: 'customContainer',
        tabClass: 'custom',
        tabTitle: 'New Tab',
        onTabOpen: function(container) {
            addCustomSettingsTabBodyContent(container);
        }
    });
}

function addCustomSettingsTabBodyContent(customTabContent) {
    customTabContent.empty(); 
    
    // Whatever you like in the tab body
    const formContainer = $('<div></div>').addClass('amq-custom-form-container');
    const mainTitle = $('<h3>')
        .text('My Custom Tab')
        .addClass('customGroupTitle')
        .css({'text-align': 'center', 'margin': '15px 0'});

    formContainer.append(mainTitle);
    customTabContent.append(formContainer);
}
```

## For regular scripts

```javascript
function addCustomSettingsTab() {
    window.AMQ_SettingsUI.createNewSettingsTab({
        tabId: 'smCustomTab',
        containerId: 'customContainer',
        tabClass: 'custom',
        tabTitle: 'New Tab',
        onTabOpen: function(container) {
            addCustomSettingsTabBodyContent(container);
        }
    });
}

function addCustomSettingsTabBodyContent(customTabContent) {
    customTabContent.empty(); 
    // ... (Same as above)
}

function loadExternalScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}

// Safely wrapped in an async IIFE to allow top-level await
(async () => {
    try {
        await loadExternalScript("https://cdn.jsdelivr.net/gh/JabroAMQ/Utilities@main/AMQ/SettingsUI/AMQSettingsUI.js");             
        addCustomSettingsTab();
    } catch (error) {
        console.error("Could not initialize Shortcuts UI due to helper script error:", error);
    }
})();
```

## Implementations

For reference, you can check real implementation cases in the next 2 projects:
- [AMQAutoModifiers.user.js](/AMQ/FasterLobbyCreation/AMQAutoModifiers.user.js) (userscript)
- [AMQShortcutsCore.js](/AMQ/Shortcuts/AMQShortcutsCore.js) (regular script)