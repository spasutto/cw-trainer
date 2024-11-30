# CWPlayer

Demonstrations and samples [here](https://spasutto.github.io/cw-trainer/samples.html)

## Usage

import `morseplayer.js` (in `head` or `body`)
```HTML
<script src="morseplayer.js"></script>
```
Instantiate the player :
```Javascript
var player = new CWPlayer({wpm:25});
player.play('Hello world !');
```

## CWPlayer instance's properties
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

## Methods
### _constructor(options)_
The `CWPlayer` constructor accepts options as an `Object` in which keys can be :
 - **wpm** (_default to 20 wpm_) : the speed in words per minute
 - **effwpm** (_default to 20 wpm_) : the effective speed in words per minute (see [Learning Methods](https://en.wikipedia.org/wiki/Morse_code#Learning_methods) and [Farnsworth speed](http://www.arrl.org/files/file/Technology/x9004008.pdf))
 > _Note: When WPM is lower than Effective WPM, the latest value is used for both_
 - **ews** (_default to 0 s_) : Extra Word Space, a space in seconds added to the normal space between words
 - **tone** (_default to 800Hz_) : the tonality
 - **volume** (_default to 1_) : the volume (from 0 to 1)
 - **keyingquality** : get or set the keying quality (between 50% : bad and 100% : perfect)
 - **predelay** (_default to 0 s_) : a time in seconds before playing the first symbol
 - **autoplay** (_default to false_) : if set to "true", a change in the text automatically starts playing

### async play(text)
`play` method start the morse playing of the text. The text can be passed as parameter otherwise `Text` property will be used. Text is cleaned. The method returns a promise wich is fulfilled at the first pause or at the end of the playing.
```Javascript
await player.play('test');
await player.play('this text is read after the first has finished');

### async renderToFile(text)
`renderToFile` method render the morse representation of the text and save it to a .wav file. The text can be passed as parameter otherwise `Text` property will be used. Text is cleaned. The method returns a promise wich is fulfilled at the end of the conversion to .wav file.
```Javascript
await player.renderToFile();
```

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

### static translate(text)
Translate to Morse the specified text :
```Javascript
let translated = CWPlayer.translate("Bonjour");
console.log(translated);
// '-... --- -. .--- --- ..- .-.'

// Prosigns
translated = CWPlayer.translate('{AS}');
console.log(translated);
// '.-...'
```

### static cleanText(text)
Used to clean the provided text.
```Javascript
let cleaned = CWPlayer.cleanText("StrÀngé ïnpùt tèxt");
console.log(cleaned);
// 'STRANGE INPUT TEXT'
```
