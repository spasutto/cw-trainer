# CW-Trainer
Offline morse code (CW) trainer inspired by the great [LCWO.net](https://lcwo.net/)

## Use
Just copy [cw-trainer.html](cw-trainer.html) on your disk or your smartphone and you're free to practice anywhere without GSM coverage
## Reuse
The `CWPlayer` class (defined at the bottom of [cw-trainer.html](cw-trainer.html)) can be reused :

```HTML
  <textarea id="cwtext" rows="4" cols="43" spellcheck="false">CQ CQ CQ DE F8XYZ F8XYZ F8XYZ AR</textarea><br>
  <input type="button" onclick="player.play(' '+cwtext.value)" value="play">
  <input type="button" onclick="player.pause()" value="pause">
  <input type="button" onclick="player.stop()" value="stop">
  <input type="button" onclick="player.WPM = 15" value="15 WPM">
  <input type="button" onclick="player.WPM = 25" value="25 WPM">
  <input type="button" onclick="player.EffWPM = 15" value="Eff 15 WPM">
  <input type="button" onclick="player.EffWPM = 25" value="Eff 25 WPM">
  <input type="button" onclick="player.Tone = 700" value="700 Hz">
  <input type="button" onclick="player.Tone = 1500" value="1500 Hz">
  <script>
    /* replace this comment by the CWPlayer class taken from cw-trainer.html */
    var player = new CWPlayer();
  </script>
```