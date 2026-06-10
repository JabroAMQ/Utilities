<p align="right">
  <b>Overview</b> | <a href="./SHORTCUTS.md">Keyboard Shortcuts Reference</a> | <a href="./DEVELOPER.md">Developer Guide</a>
</p>
<hr />

# AMQ Custom Shortcuts

A customizable keyboard shortcuts userscript for AMQ to streamline your gameplay, chat, and navigation.

![Shortcuts Settings Tab](images/shortcutsTab.png)

You can bind your own custom `Ctrl + Key` combinations directly within the new **Shortcuts** tab inside the Settings modal.

> [!WARNING]
> You cannot bind the same key to two different actions. The game will alert you if a key is already in use.

> [!NOTE]
> You can unbind a key by using `Backspace` or `Delete` keys.

> [!TIP]
> Need inspiration? Check out [SHORTCUTS.md](SHORTCUTS.md) for recommended key setups.

## Available shortcuts:

### Vote to skip the current song

Simulate a click on the "VoteSkip" button in game

<hr>

### Select the answer box input

Simulate a click on the answer box input, allowing you to start writing an answer immediately

<hr>

### Select the lobby chat box input

Simulate a click on the lobby chat box input, allowing you to start writing a message immediately

<hr>

### Open/Close the song list

Open the built-in song list modal if it is closed, or close it otherwise.

Can be used everywhere inside AMQ, you don't need to be playing a game for it to work.

<hr>

### Open/Close Joseph's "Installed Userscripts" modal

Open TheJoseph98's Installed Userscripts modal if it is closed, or close it otherwise
<br><img src="images/installedUserscripts.png" width="400" alt="Installed Userscripts" />

Probably only useful for debugging purposes while creating your own userscript.

<hr>

### Open the Anime List tab from the Settings modal

Open the Anime List tab from the Settings modal
<br><img src="images/animeListTab.png" width="400" alt="Anime List" />

> [!NOTE]
> If it is already opened, it doesn't close it. You can close it using `Escape` instead.

> [!TIP]
> You can cycle between tabs inside the Settings modal using `Shift + Tab`.

<hr>

### Open the Shortcuts tab from the Settings modal

Open the Shortcuts tab from the Settings modal
<br><img src="images/shortcutsTab.png" width="400" alt="Shortcuts Tab" />

> [!NOTE]
> If it is already opened, it doesn't close it. You can close it using `Escape` instead.

> [!TIP]
> You can cycle between tabs inside the Settings modal using `Shift + Tab`.

<hr>

### Check if the user (name below) is online, opening their dm if so

Niche shortcut to open the DM of a specific player.

You can configure who is that player from the Shortcuts tab in the Settings modal
<br><img src="images/checkUserOnline1.png" width="400" alt="Config Username" />

Its only real utility is in combination with Nyamu's [FriendOnlineNotifier](https://github.com/nyamu-amq/amq_scripts/blob/master/amqFriendOnlineNotifier.user.js) userscript, for easily instayapping with them once they go online
<br><img src="images/checkUserOnline2.png" width="400" alt="Friend Notification" />

# Requirements

[Tampermonkey](https://www.tampermonkey.net/) (or any other alternative option) for installing the AMQ script.
