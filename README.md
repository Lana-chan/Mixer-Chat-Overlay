# mixer-Chat-Overlay
A simple chat overlay for Mixer.com users.

## Usage:
1. Clone or download ZIP (https://github.com/Lana-chan/Mixer-Chat-Overlay/archive/master.zip).
2. Open up OBS.
3. Create a new browser overlay element.
4. Put in the URL for the chat.
5. Make sure to customize the URL with your name.

## URL:
Use the file locally (do not check local file on OBS) following this example:

```
file:///C:/path/to/Mixer-Chat-Overlay/mixerchatter/chat/chat.html?username=MixerUsername&timer=10000&dir=top
```

## Settings:
1. username - your Mixer username or of the channel you want to monitor.<br>
2. timer - time in milliseconds for each chat message to stay on screen.<br>
3. dir - direction which the chat goes, 'top' or 'bottom', default 'bottom'.
