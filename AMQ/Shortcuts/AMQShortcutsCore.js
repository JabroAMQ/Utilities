// Creates the Shortcuts tab in the Settings modal if it doesn't exist and creates the logic for registering shortcuts, saving them in localStorage
// This code is fetched automatically
// Do not attempt to add it to tampermonkey
 
if (!window.ShortcutsManager) {

    // Logic for managing shortcuts
    const registeredShortcuts = [];
    const cachedKeys = {};

    function loadShortcutCache(shortcutId) {
        const savedKeys = JSON.parse(localStorage.getItem('AMQ_CustomShortcuts') || '{}');
        if (savedKeys.hasOwnProperty(shortcutId)) {
            cachedKeys[shortcutId] = savedKeys[shortcutId];
        } else {
            cachedKeys[shortcutId] = null;
        }
    }

    function saveShortcutKey(shortcutId, newKey) {
        const cleanKey = newKey ? newKey.toLowerCase() : null;
        cachedKeys[shortcutId] = cleanKey;
        
        const savedKeys = JSON.parse(localStorage.getItem('AMQ_CustomShortcuts') || '{}');
        savedKeys[shortcutId] = cleanKey;
        localStorage.setItem('AMQ_CustomShortcuts', JSON.stringify(savedKeys));
    }

    function setupKeyboardGlobalListener() {
        document.addEventListener('keydown', (e) => {
            // Default shortcuts logic (Shift + Tab navigation in Settings)
            if (e.shiftKey && e.key === 'Tab') {
                const $settingsModal = $('#settingModal');

                if ($settingsModal.is(':visible')) {
                    e.preventDefault();
                    const $allTabs = $settingsModal.find('.tabContainer .tab');
                    if ($allTabs.length === 0) return;

                    const $activeTab = $allTabs.filter('.selected');
                    let nextIndex = 0;
                    if ($activeTab.length > 0) {
                        const currentIndex = $allTabs.index($activeTab);
                        nextIndex = (currentIndex + 1) % $allTabs.length;
                    }

                    $allTabs.eq(nextIndex).click();
                    return;
                }
            }

            // Custom shortcuts logic (Ctrl + [Key])
            if (e.ctrlKey) {
                const pressedKey = e.key.toLowerCase();
                const activeShortcut = registeredShortcuts.find(s => cachedKeys[s.id] !== null && cachedKeys[s.id] === pressedKey);
                
                if (activeShortcut) {
                    e.preventDefault();
                    activeShortcut.callback();
                }
            }
        });
    }


    // Shortcuts tab UI
    function addShortcutsSettingsTab() {
        window.AMQ_SettingsUI.createNewSettingsTab({
            tabId: 'smShortcutsTab',
            containerId: 'shortcutsContainer',
            tabClass: 'shortcuts',
            tabTitle: 'Shortcuts',
            onTabOpen: function() {
                addShortcutsSettingsTabBodyContent();
            }
        });
    }

    function addShortcutsSettingsTabBodyContent() {
        const shortcutsTabContent = $('#shortcutsContainer');
        shortcutsTabContent.empty(); 
        
        const formContainer = $('<div></div>').addClass('amq-shortcuts-form-container');

        // Header
        const headerInfo = $('<div></div>')
            .addClass('amq-shortcuts-header-info')
            .append($('<p></p>').html('You can press <kbd>Esc</kbd> to close the settings modal'))
            .append($('<p></p>').html('You can press <kbd>Shift</kbd> + <kbd>Tab</kbd> to cycle between tabs'));
        formContainer.append(headerInfo);

        // Body
        registeredShortcuts.forEach(shortcut => {
            const currentKey = cachedKeys[shortcut.id];
            const displayValue = currentKey ? `Ctrl + ${currentKey.toUpperCase()}` : 'None';

            const row = $('<div></div>').addClass('amq-shortcut-card');
            const label = $('<label></label>').text(shortcut.description).addClass('amq-shortcut-description');
            const inputContainer = $('<div></div>').addClass('amq-shortcut-input-container');
            
            const input = $('<input>')
                .attr('type', 'text')
                .attr('readonly', true)
                .attr('tabindex', '-1')
                .addClass('form-control text-center amq-shortcut-key-input')
                .addClass(currentKey ? 'amq-shortcut-key-active' : 'amq-shortcut-key-disabled')
                .val(displayValue)
                .attr('placeholder', 'Press a key...');

            input.on('keydown', function(e) {
                // Allow users to exit the input with Escape or Shift + Tab without changing the shortcut
                if (e.key === 'Escape' || (e.shiftKey && e.key === 'Tab')) {
                    $(this).blur();
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                
                // Allow users to clear the shortcut with Backspace or Delete
                if (e.key === 'Backspace' || e.key === 'Delete') {
                    saveShortcutKey(shortcut.id, null);
                    $(this).val('None').removeClass('amq-shortcut-key-active').addClass('amq-shortcut-key-disabled');
                    $(this).blur();
                    return;
                }
                
                if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

                const pressedKey = e.key.toLowerCase();
                if (pressedKey.length === 1) {
                    // Collision check
                    for (const id in cachedKeys) {
                        if (id !== shortcut.id && cachedKeys[id] === pressedKey) {
                            const conflictingShortcut = registeredShortcuts.find(s => s.id === id);
                            const conflictingDesc = conflictingShortcut ? conflictingShortcut.description : "Unknown action";
                            
                            Swal.fire({
                                target: '#settingModal',
                                icon: 'warning',
                                title: 'Key Already Assigned',
                                html: `The key combination <kbd>Ctrl</kbd> + <kbd>${pressedKey.toUpperCase()}</kbd> is already assigned to:<br><br><b>${conflictingDesc}</b><br><br>Please clear or modify that shortcut first.`,
                                showConfirmButton: true,
                                confirmButtonColor: '#3085d6',
                                confirmButtonText: 'OK'
                            });
                            
                            $(this).blur();
                            return;
                        }
                    }

                    // Save the key if available
                    saveShortcutKey(shortcut.id, pressedKey);
                    $(this).val(`Ctrl + ${pressedKey.toUpperCase()}`).removeClass('amq-shortcut-key-disabled').addClass('amq-shortcut-key-active');
                    $(this).blur();
                }
            });

            inputContainer.append(input);
            row.append(label).append(inputContainer);

            if (typeof shortcut.renderExtraInfo === 'function') {
                shortcut.renderExtraInfo(row);
            }

            formContainer.append(row);
        });

        shortcutsTabContent.append(formContainer);
    }

    // Only creates AMQ_addStyle if the userscript implementing this library does not implements god TheJoseph98's amqScriptInfo.js
    if (typeof AMQ_addStyle !== 'function') {
        window.AMQ_addStyle = function(css) {
            let style = document.createElement("style");
            style.type = "text/css";
            style.appendChild(document.createTextNode(css));
            document.head.appendChild(style);
        };
    }

    AMQ_addStyle(`
        #shortcutsContainer {
            max-height: 650px;
            overflow-y: auto;
            padding-bottom: 20px;
        }

        .amq-shortcuts-form-container {
            max-width: 500px;
            margin: 25px auto 0 auto;
            padding: 0 10px;
        }

         .amq-shortcuts-header-info {
            text-align: center;
            margin-bottom: 25px;
            padding: 10px;
            background-color: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid #444;
            border-top: 1px solid #444;
        }

        .amq-shortcuts-header-info p {
            margin: 4px 0;
            font-size: 12px;
            color: #aaa;
        }

        .amq-shortcuts-header-info kbd {
            background-color: #1b1b1b;
            color: #449d44;
            border: 1px solid #555;
            border-radius: 3px;
            box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 0 0 2px #222 inset;
            padding: 2px 5px;
            font-family: inherit;
            font-size: 11px;
            font-weight: bold;
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


    // Public API for registering shortcuts
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

    window.ShortcutsManager = {
        register: function(shortcutConfig) {
            /* 
               shortcutConfig data structure example:
               { 
                 id: "checkFriendOnline", 
                 description: "Check if friend...", 
                 callback: function, 
                 renderExtraInfo: function(row) [Optional] 
               }
            */
            if (!shortcutConfig.id || !shortcutConfig.callback) return;

            // TODO: How to handle duplicate IDs? For now, we just ignore them
            if (registeredShortcuts.some(s => s.id === shortcutConfig.id)) return;

            registeredShortcuts.push(shortcutConfig);
            loadShortcutCache(shortcutConfig.id);
        },

        init: async function() {
            setupKeyboardGlobalListener();
            
            try {
                await loadExternalScript("https://cdn.jsdelivr.net/gh/JabroAMQ/Utilities@main/AMQ/AMQSettingsUI.js");             
                addShortcutsSettingsTab();
            } catch (error) {
                console.error("Could not initialize Shortcuts UI due to helper script error:", error);
            }
        }
    };
}