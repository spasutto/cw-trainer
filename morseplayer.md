# MorsePlayer

Demonstrations and samples [here](https://spasutto.github.io/cw-trainer/samples.html)

## Usage

import `morseplayer.js` (in `head` or `body`)
```HTML
<script src="morseplayer.js"></script>
```
Insert the player
```HTML
<morse-player>cq cq cq de F8XYZ</morse-player>
```
**Or**, in JS :
```Javascript
window.addEventListener("load", (event) => {
  let mp = new MorsePlayer({wpm:25});
  document.body.appendChild(mp);
  mp.Text = 'Hello world !';
});
```
**&#9888; : the first call to a playing method (such as play or setting `autoplay` attribute to true) must be initiated from a user gesture on the page** (https://developer.chrome.com/blog/autoplay/#web_audio). Subsequent calls can be done without condition

### Styling
By default `morse-player` stretches and use full width. However you can define a specific width :
```HTML
<style>
morse-player {
    width: 380px;
}
</style>
```

## Attributes
The `morse-player` tag accept some attributes (case insensitive) :
 - **text** : the text to play (can also be set inside the `morse-player` tags)
 - **wpm** (_default to 20 wpm_) : the speed in words per minute
 - **effwpm** (_default to 20 wpm_) : the effective speed in words per minute (see [Learning Methods](https://en.wikipedia.org/wiki/Morse_code#Learning_methods) and [Farnsworth speed](http://www.arrl.org/files/file/Technology/x9004008.pdf))
 > _Note: When WPM is lower than Effective WPM, the latest value is used for both_
 - **ews** (_default to 0 s_) : Extra Word Space, a space in seconds added to the normal space between words
 - **tone** (_default to 800Hz_) : the tonality
 - **volume** (_default to 1_) : the volume (from 0 to 1)
 - **keyingquality** : get or set the keying quality (between 50% : bad and 100% : perfect)
 - **predelay** (_default to 0 s_) : a time in seconds before playing the first symbol
 - **autoplay** (_default to false_) : if set to "true", a change in the text automatically starts playing
 - **progessbar** (_default to true_) : if set to false the playing/progress bar is hidden
 - **clearzone** (_default to false_) : if set to true, a zone under the player displays the currently playing symbols
 - **configbutton** (_default to true_) : if set to true, add a settings zone
 - **downloadbutton** (_default to false_) : if set to true, add a "download to .wav" button

## MorsePlayer instance's properties
 - **Playing** : the player is currently playing
 - **Paused** : the player is currently paused
 - **WPM** : get or set the WPM
 - **EffWPM** : get or set the Effective WPM (see [Learning Methods](https://en.wikipedia.org/wiki/Morse_code#Learning_methods) and [Farnsworth speed](http://www.arrl.org/files/file/Technology/x9004008.pdf))
 - **EWS** : get or set Extra Word Space
 - **Tone** : get or set tone's frequency
 - **Volume** : get or set volume
 - **KeyingQuality** : get or set the keying quality (between 50% : bad and 100% : perfect)
 - **PreDelay** : get or set the delay before playing firs symbol
 - **Text** : get or set the text to play. Text is "cleaned" :
```Javascript
player.Text = "StrÀngé ïnpùt tèxt";
console.log(player.Text);
// 'STRANGE INPUT TEXT'
```
Prosigns can be entered between `{` and `}` and will be played as prosigns :
```Javascript
player.Text = "VE3YYY de F8XXX {AS}";
```
 - **TextArray** : get an array of the current text, including prosigns. Each element is either a *letter/number/punctuation* or a *prosign*.
 - **Index** : get or set the playing's index (**in the TextArray property !**)
 - **ProgressBar** : display/hide the progress bar
 - **ClearZone** : display/hide the clear text zone (currently playing)
 - **ConfigButton** : display/hide the settings button
 - **DownloadButton** : display/hide the download button
 - **HPFix** : set to true if you experience truncation of symbols while using USB/Bluetooth headphones on Android devices

## Methods
### _constructor(options)_
`new MorsePlayer(options)` : options are the same as those used in the [attribute section](#attributes).

### async play(text)
`play` method start the morse playing of the text. The text can be passed in parameter otherwise it's come from `Text` property and is cleaned. The method returns a promise wich is fulfilled at the first pause or at the end of the playing.
```Javascript
await player.play('test');
await player.play('this text is read after the first has finished');
```
_Note_ : `play()` automatically pauses others instances of MorsePlayer on the page

### pause()
stops the playing

### stop()
stops the playing and reset the current playing time

### playBoop()
play a 'boop' sound (used for wrong entry in simple mode)

### addEventListener(event_name, func)
Register an event listener
```Javascript
player.addEventListener('play', () => {
    console.log('CW Time !');
});
player.addEventListener('parameterchanged', (param) => {
    console.log(`"${param}" changed to ${player[param]}`);
});
```

#### Supported events
 - `parameterchanged` : one of the properties of the player has changed. The parameter's name is passed as argument with the event.
 - `indexchanged` : the current index in the input text changed. **Warning** the index reference the `Text` property, which is cleaned (and thus can be different from original provided text)
 - `play` : playing has started or been resumed from pause
 - `pause` : playing has been temporarily stopped
 - `stop` : playing has been definitely stopped
 - `recording` : recording to wave has started. `stop` is triggered once finished

### on(event_name, func)
Register an event listener, **triggered only once**
```Javascript
player.on('play', () => {
    // this message will appear only once even if play is called multiple times
    console.log('CW Time !');
});
```

### removeEventListener(event_name, func?) / removeEventListener(func)
Remove the event listener. If no `func` is provided, remove all the listeners. If only `func` is provided, remove this listener from all events.
