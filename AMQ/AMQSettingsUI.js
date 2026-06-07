// Universal tab generator for AMQ Settings Modal
// This code is fetched automatically
// Do not attempt to add it to tampermonkey
 
if (!window.AMQ_SettingsUI) {
    window.AMQ_SettingsUI = {
        createNewSettingsTab: function(config) {
            if ($(`#${config.tabId}`).length > 0) return;

            // 1. Append the tab button to the side bar
            $('#settingModal .tabContainer').append(
                $('<div></div>')
                    .attr('id', config.tabId)
                    .addClass(`tab clickAble ${config.tabClass}`)
                    .attr('onClick', `options.selectTab('${config.containerId}', this)`)
                    .append($('<h5></h5>').text(config.tabTitle))
            );

            // 2. Append the main content container
            const tabContent = $('<div></div>')
                .attr('id', config.containerId)
                .addClass('settingContentContainer customScrollbar hide');
            $('#settingModal .modal-body').append(tabContent);

            // 3. Global resize listener (Registered only once defensively)
            if (!window.AMQ_ModalResizeRegistered) {
                window.AMQ_ModalResizeRegistered = true;
                $('#settingModal').on('shown.bs.modal', function () {
                    const modalContent = $('#settingModal .modal-dialog');
                    const modalTab = $('#settingModal .tabContainer');
                    modalContent.css('width', `${modalTab.width()}px`);
                });
            }

            // 4. Show tab event & trigger reactive content rendering
            $('#settingModal .tabContainer').on('click', `.${config.tabClass}`, function () {
                tabContent.removeClass('hide');
                if (typeof config.onTabOpen === 'function') {
                    config.onTabOpen(tabContent);
                }
            });

            // 5. Hide tab event when clicking ANY other tab
            $('#settingModal .tabContainer').on('click', '.tab', function () {
                const $clickedTab = $(this);
                if (!$clickedTab.hasClass(config.tabClass)) {
                    tabContent.addClass('hide');
                    $(`#${config.tabId}`).removeClass('selected');
                } else {
                    $clickedTab.addClass('selected');
                }
            });
        }
    };
}