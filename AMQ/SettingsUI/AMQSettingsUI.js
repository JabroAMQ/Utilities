// Universal tab generator for AMQ Settings Modal
// This code is fetched automatically
// Do not attempt to add it to tampermonkey
 
if (!window.AMQ_SettingsUI) {
    window.AMQ_SettingsUI = {
        createNewSettingsTab: function(config) {
            if ($(`#${config.tabId}`).length > 0) return;

            // Append the tab button to the side bar
            $('#settingModal .tabContainer').append(
                $('<div></div>')
                    .attr('id', config.tabId)
                    .addClass(`tab clickAble ${config.tabClass}`)
                    .attr('onClick', `options.selectTab('${config.containerId}', this)`)
                    .append($('<h5></h5>').text(config.tabTitle))
            );

            // Append the main content container
            const tabContent = $('<div></div>')
                .attr('id', config.containerId)
                .addClass('settingContentContainer customScrollbar hide')
                .attr('data-tab-button-id', config.tabId)
                .attr('data-tab-class', config.tabClass);

            $('#settingModal .modal-body').append(tabContent);

            // Global Core Initialization
            if (!window.AMQ_SettingsUI_CoreInitialized) {
                window.AMQ_SettingsUI_CoreInitialized = true;

                // Resize listener
                $('#settingModal').on('shown.bs.modal', function () {
                    const modalContent = $('#settingModal .modal-dialog');
                    const modalTab = $('#settingModal .tabContainer');
                    modalContent.css('width', `${modalTab.width()}px`);
                });

                // Listener to hide custom tabs when ANY other tab is clicked
                $('#settingModal .tabContainer').on('click', '.tab', function () {
                    const $clickedTab = $(this);
                    
                    // Find all containers managed by this UI library
                    $('.settingContentContainer[data-tab-class]').each(function() {
                        const $container = $(this);
                        const tabClass = $container.attr('data-tab-class');
                        const tabId = $container.attr('data-tab-button-id');

                        if (!$clickedTab.hasClass(tabClass)) {
                            $container.addClass('hide');
                            $(`#${tabId}`).removeClass('selected');
                        } else {
                            $clickedTab.addClass('selected');
                        }
                    });
                });
            }

            // Specific reactive trigger for this instance's callback on click
            $('#settingModal .tabContainer').on('click', `.${config.tabClass}`, function () {
                tabContent.removeClass('hide');
                if (typeof config.onTabOpen === 'function') {
                    config.onTabOpen(tabContent);
                }
            });

        }
    };
}