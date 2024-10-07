class CWPlayer {
  static morse = {
    ' ' : '\t',
    'A' : '.-',
    'B' : '-...',
    'C' : '-.-.',
    'D' : '-..',
    'E' : '.',
    'F' : '..-.',
    'G' : '--.',
    'H' : '....',
    'I' : '..',
    'J' : '.---',
    'K' : '-.-',
    'L' : '.-..',
    'M' : '--',
    'N' : '-.',
    'O' : '---',
    'P' : '.--.',
    'Q' : '--.-',
    'R' : '.-.',
    'S' : '...',
    'T' : '-',
    'U' : '..-',
    'V' : '...-',
    'W' : '.--',
    'X' : '-..-',
    'Y' : '-.--',
    'Z' : '--..',
    '0' : '-----',
    '1' : '.----',
    '2' : '..---',
    '3' : '...--',
    '4' : '....-',
    '5' : '.....',
    '6' : '-....',
    '7' : '--...',
    '8' : '---..',
    '9' : '----.',
    '/' : '-..-.',
    '+' : '.-.-.',
    '=' : '-...-',
    '.' : '.-.-.-',
    ',' : '--..--',
    '"' : '.-..-.',
    '$' : '...-..-',
    '\'' : '.----.',
    '(' : '-.--.',
    ')' : '-.--.-',
    '[' : '-.--.',
    ']' : '-.--.-',
    '-' : '-....-',
    ':' : '---...',
    ';' : '-.-.-.',
    '@' : '.--.-.',
    '_' : '..--.-',
    '!' : '---.',
    '?' : '..--..'
  };
  static DEFAULT_OPTIONS = {
    wpm : 20,
    effwpm : 20,
    tone : 800,
    keyqual : 1,
    ews : 0,
    predelay : 0,
    autoplay : false
  };
  elperiod = 0.06; // 20WPM.
  spperiod = 0.06;
  rampperiod = 0.005;
  constructor(options) {
    this.text = '';
    this.curti = -1;
    this.endtime = this.starttime = this.lastpausetime = this.totalpausetime = this.totaltime = 0;
    this.stime = [];
    this.booping = this.playing = this.paused = false;
    this.events = {};
    this.onplayend = null;
    this.init(options);
  }
  init(options) {
    this.options = {...CWPlayer.DEFAULT_OPTIONS, ...options};
    let defaultkeys = Object.keys(CWPlayer.DEFAULT_OPTIONS);
    // suppression des options invalides
    Object.keys(this.options).forEach(k => {
      if (!defaultkeys.includes(k)) delete this.options[k];
    });
    this.WPM = this.options.wpm;
    this.EffWPM = this.options.effwpm;
    this.Tone = this.options.tone;
    this.EWS = this.options.ews;
    this.PreDelay = this.options.predelay;
    this.AutoPlay = this.options.autoplay;
  }

  /*CONSTANTES*/
  static get MIN_WPM() { return 1; };
  static get MAX_WPM() { return 60; };
  static get MIN_EWS() { return 0; };
  static get MAX_EWS() { return 10; };
  static get MIN_TONE() { return 100; };
  static get MAX_TONE() { return 5000; };
  static get MIN_KEYQUAL() { return 0.5; };
  static get MAX_KEYQUAL() { return 1; };
  /*FIN CONSTANTES*/

  get WPM() {
    return Math.round(6 / (5 * this.elperiod));
  }
  set WPM(value) {
    value = CWPlayer.parseint(value);
    value = Math.min(CWPlayer.MAX_WPM, Math.max(CWPlayer.MIN_WPM, value));
    this.options.wpm = value;
    // "PARIS " ==> 50 unités. à 1 WPM il faut donc 60/50 secondes pour envoyer une unité (un 'dit')
    // Dit: 1 unit
    // Dah: 3 units
    // Intra-character space (the gap between dits and dahs within a character): 1 unit
    // Inter-character space (the gap between the characters of a word): 3 units
    // Word space (the gap between two words): 7 units
    let effwpm=this.EffWPM; // on sauvegarde ça sinon c'est perdu vu que ça s'appuie sur elperiod
    this.elperiod = 6 / (5 * value);
    this.spperiod = ((60/effwpm)-31*this.elperiod)/19;
    if (value<this.EffWPM) {
      this.EffWPM = value;
    } else {
      // ce traitement aurait déjà été fait dans le if dans le setter de EffWPM
      this.totaltime = this.getDuration();
      this.schedule();
    }
    this.fireEvent('parameterchanged', 'WPM');
  }
  get EffWPM() {
    return Math.round(60/(19*this.spperiod+31*this.elperiod));
  }
  set EffWPM(value) {
    value = CWPlayer.parseint(value);
    value = Math.min(CWPlayer.MAX_WPM, Math.max(CWPlayer.MIN_WPM, value));
    this.options.effwpm = value;
    if (this.WPM<value) {
      this.WPM = value;
    }
    this.spperiod = ((60/value)-31*this.elperiod)/19;
    this.totaltime = this.getDuration();
    this.schedule();
    this.fireEvent('parameterchanged', 'EffWPM');
  }
  get EWS() { return this.options.ews; }
  set EWS(value) {
    value = CWPlayer.parsefloat(value);
    value = Math.min(CWPlayer.MAX_EWS, Math.max(CWPlayer.MIN_EWS, value));
    this.options.ews = value;
    this.totaltime = this.getDuration();
    this.schedule();
    this.fireEvent('parameterchanged', 'EWS');
  }
  get Tone() { return this.options.tone; }
  set Tone(value) {
    value = CWPlayer.parseint(value);
    value = Math.min(CWPlayer.MAX_TONE, Math.max(CWPlayer.MIN_TONE, value));
    this.options.tone = value;
    if (this.context) {
      this.osc.frequency.setValueAtTime(this.options.tone, this.context.currentTime);
    }
    this.fireEvent('parameterchanged', 'Tone');
  }
  get KeyingQuality() { return this.options.keyqual; }
  set KeyingQuality(value) {
    value = CWPlayer.parsefloat(value);
    value = Math.min(CWPlayer.MAX_KEYQUAL, Math.max(CWPlayer.MIN_KEYQUAL, value));
    this.options.keyqual = value;
    this.totaltime = this.getDuration();
    this.schedule();
    this.fireEvent('parameterchanged', 'KeyingQuality');
  }
  get PreDelay() { return this.options.predelay; }
  set PreDelay(value) {
    value = CWPlayer.parseint(value);
    value = Math.max(0, value);
    this.options.predelay = value;
    this.totaltime = this.getDuration();
    this.schedule();
    this.fireEvent('parameterchanged', 'PreDelay');
  }
  get AutoPlay() { return this.options.autoplay; }
  set AutoPlay(value) {
    this.options.autoplay = CWPlayer.parsebool(value);
    this.fireEvent('parameterchanged', 'AutoPlay');
  }
  get Paused() { return this.paused; }
  set Paused(value) { this.Playing = !value; }
  get Playing() { return this.playing; }
  set Playing(value) {
    value = CWPlayer.parsebool(value);
    if (value === false && this.playing) {
      this.pause();
    } else if (value === true && !this.playing) {
      this.play();
    }
  }
  get Text() {
    return this.text;
  }
  set Text(value) {
    value = CWPlayer.cleanText(value ?? '');
    let oldtext = this.text;
    if (value == oldtext) return;
    // si on modifie le texte qui a déjà été joué on remet la lecture à 0
    if (this.curti>=0 && (value.length<=this.curti || value.substring(0, this.curti) != this.text.substring(0, this.curti))) {
      this.text = value;
      this.totaltime = this.getDuration();
      this.fireEvent('parameterchanged', 'Text');
      this.Index = -1;
    } else {
      this.text = value;
      this.totaltime = this.getDuration();
      this.fireEvent('parameterchanged', 'Text');
      this.fireEvent('indexchanged');
      if (this.playing) {
        //this.itime.findIndex(s => s >= this.context.currentTime + 0.100);
        //let startindex = this.curti+2;
        let startindex = Math.min(this.curti+2, CWPlayer.sharedStart([oldtext, value]).length);
        //cwplayer.Text='aaaa';window.setTimeout(()=>{cwplayer.Text='aann';}, 1400);
        //console.log(`rescheduling @${startindex}, silence starting from ${this.itime[startindex-1]} (${(this.context.currentTime-this.starttime-this.totalpausetime)+this.itime[startindex-1]}) (${oldtext}/${value})`, this.itime);
        //this.gain.gain.cancelScheduledValues((this.context.currentTime-this.starttime-this.totalpausetime)+this.itime[startindex-1]);
        this.schedule(null, startindex);
      } else if (this.options.autoplay) {
        this.play();
      }
    }
  }
  get Index() { return this.curti; }
  set Index(value) {
    value = CWPlayer.parseint(value);
    value = Math.max(-1, Math.min(this.text.length-1, value));
    if (value == this.curti) return;
    this.curti = value;
    this.totalpausetime = 0;
    let now = this.context?.currentTime ?? 0;
    let time = value<0 ? 0 : this.itime[value];
    this.starttime = now-time;
    this.lastpausetime = now;
    this.fireEvent('indexchanged');
    this.schedule(time);
  }
  get TotalTime() { return this.totaltime;  }
  get CurrentTime() {
    if (this.playing) {
      return (this.context.currentTime-this.starttime-this.totalpausetime);
    } else {
      return (this.lastpausetime-this.starttime-this.totalpausetime);
    }
  }
  set CurrentTime(value) {
    value = CWPlayer.parsefloat(value);
    value = Math.max(0, Math.min(this.totaltime, value));
    this.curti = this.itime.findIndex(s => s>=value)-1;
    this.totalpausetime = 0;
    let now = this.context?.currentTime ?? 0;
    this.starttime = now-value;
    this.lastpausetime = now;
    this.fireEvent('indexchanged');
    this.schedule(value);
  }

  fireEvent(evtname, args) {
    if (!this.events[evtname]) return;
    this.events[evtname].forEach(evt => {if (typeof evt === 'function') evt(args);});
  }
  addEventListener(evtname, cb) {
    if (!this.events[evtname]) this.events[evtname] = [];
    this.events[evtname].push(cb);
  }
  on(evtname, cb) { return this.addEventListener(evtname, cb); }
  removeEventListener(evtname, cb=null) {
    if (typeof evtname === 'function') {
      cb = evtname;
      Object.keys(this.events).forEach(k => {
        this.events[k] = this.events[k].filter(cb2 => cb2!==cb);
      });
    } else {
      if (!this.events[evtname]) return;
      if (!cb) {
        delete this.events[evtname];
      } else {
        this.events[evtname] = this.events[evtname].filter(cb2 => cb2!==cb);
      }
    }
  }
  static parsebool(value) { return (typeof value === 'string') ? value.trim().toLowerCase() == 'true' : !!value; }
  static parseint(value) { value = (typeof value === 'string') ? parseInt(value.trim(), 10) : value; return value = isNaN(value) ? 0 : value; }
  static parsefloat(value) { value = (typeof value === 'string') ? parseFloat(value.trim()) : value; return value = isNaN(value) ? 0 : value; }
  static cleanText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replaceAll(/(\r?\n)+/g, '  ') // retour à la ligne : deux espaces
      .replaceAll(/[^A-Z0-9\/\+=\.,"\$'\(\)\[\]\-\:;@_!\? ]/g, '?')
      /*.replaceAll(/\s+/g, ' ')*/;
  }
  static translate(text) {
    text = CWPlayer.cleanText(text);
    return CWPlayer.internalTranslate(text);
  }
  static isSpace(c) { return c == ' ' || c == '\t'; }
  static internalTranslate(text) {
    let cwtext = '';
    for (let i=0; i<text.length; i++) {
      if (i>0 && !CWPlayer.isSpace(text[i-1]) && !CWPlayer.isSpace(text[i])) cwtext += ' '; // on rajoute un espace après tout caractère (sauf si le celui-ci ou le courant est un espace)
      cwtext += CWPlayer.morse[text[i]] ?? CWPlayer.morse['?'];
    }
    return cwtext;
  }

  static async delay(s) {
    return new Promise(res => setTimeout(res, s*1000));
  }
  static sharedStart(array){
    var A= array.concat().sort(), 
    a1= A[0], a2= A[A.length-1], L= a1.length, i= 0;
    while(i<L && a1.charAt(i)=== a2.charAt(i)) i++;
    return a1.substring(0, i);
  }

  initAudio() {
    if (this.context) {
      return;
    }
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.osc = this.context.createOscillator();
    this.gain = this.context.createGain();
    this.osc.connect(this.gain);//.connect(this.context.destination);
    this.osc.frequency.value = this.options.tone;
    this.gain.gain.value = 0;
    this.osc.start();
    this.gain.connect(this.context.destination);
  }
  async playBoop() {
    if (this.playing) {
      this.stop();
    } else if (!this.context) {
      this.initAudio();
    }
    this.gain.connect(this.context.destination);
    this.booping = true;

    let initTime = this.context.currentTime;
    let t = initTime+0.05;
    this.osc.frequency.setValueAtTime(500, t);
    this.gain.gain.setValueAtTime(0, t);
    this.gain.gain.linearRampToValueAtTime(1, t + this.rampperiod);
    t += 0.1;
    this.osc.frequency.setValueAtTime(250, t);
    t += 0.1;
    this.gain.gain.setValueAtTime(1, t - this.rampperiod);
    this.gain.gain.linearRampToValueAtTime(0, t);
    await CWPlayer.delay(t-initTime);
    this.booping = false;
  }
  stopSound() {
    let curGain = this.gain.gain.value;
    if (curGain > 0) {
      let stopTime = this.context.currentTime + this.rampperiod;
      this.gain.gain.linearRampToValueAtTime(curGain, this.context.currentTime);
      this.gain.gain.linearRampToValueAtTime(0, stopTime);
      return this.rampperiod;
    }
    return 0;
  }
  stop(pause=false) {
    if (this.booping) return;
    this.paused = pause;
    if (!pause) {
      this.curti = -1;
      this.totalpausetime = this.lastpausetime = this.starttime = this.endtime = 0;
      this.fireEvent('indexchanged');
    }
    if (this.playing) {
      this.playing = false;
      this.gain.gain.cancelScheduledValues(this.context.currentTime);
      this.stopSound();
      if (this.onplayend) {
        this.onplayend();
        this.onplayend = null;
      }
      /*try {
        this.gain.disconnect(this.context.destination);
      } catch(e) {}*/
    }
    this.fireEvent(pause?'pause':'stop');
  }
  pause() {
    if (!this.playing || this.booping) return;
    this.lastpausetime = this.context.currentTime;
    return this.stop(true);
  }
  async play(text) {
    return new Promise(res => {
      if (this.playing || this.booping) {
        res();
        return;
      }
      if (typeof text === 'string') this.Text = text;
      if (this.text.length == 0) {
        res();
        return;
      }
      this.onplayend = res;
      if (!this.context) {
        this.initAudio();
      }
      if (this.starttime==0) {
        this.totalpausetime = 0;
        this.lastpausetime = this.starttime = this.context.currentTime+Number.EPSILON; // au premier coup -> après initaudio currentTime vaut 0
      }
      this.gain.gain.value = 0;
      //this.gain.connect(this.context.destination);
  
      this.playing = true;
      this.paused = false;
      this.schedule(this.lastpausetime-this.starttime-this.totalpausetime);
      if (this.lastpausetime > 0) {
        this.totalpausetime += (this.context.currentTime-this.lastpausetime);
        this.lastpausetime = 0;
      }
      this.fireEvent('play');
    });
  }
  async startStopWaiter() {
    let localTime = performance.now();
    this.localTime = localTime;
    let curti = 0;
    while (this.playing && this.localTime == localTime && this.context.currentTime<this.endtime) {
      curti = this.itime.findIndex(s => s+this.starttime >= this.context.currentTime-this.totalpausetime)-1;
      if (curti != this.curti) {
        this.curti = curti;
        this.fireEvent('indexchanged');
      }
      await CWPlayer.delay(0.01);
    }
    if (this.playing && this.localTime == localTime) {
      this.stop();
    }
  }
  schedule(timefromstart, startindex) {
    if (!this.context || !this.playing) return;
    let it = this.context.currentTime;
    this.osc.frequency.setValueAtTime(this.options.tone, it);
    if (typeof startindex !== 'number') {
      startindex = 0;
    } else {
      startindex = Math.min(this.text.length-1, Math.max(0, startindex));
    }
    if (typeof timefromstart !== 'number') {
      timefromstart = this.context.currentTime-this.starttime-this.totalpausetime;
    }
    if (startindex == 0) {
      this.gain.gain.cancelScheduledValues(it);
      timefromstart-=this.stopSound();
    } else {
      this.gain.gain.cancelScheduledValues(this.starttime+this.totalpausetime+this.itime[startindex?startindex-1:0]);
    }
    let t=0;
    for (let i=startindex; i<this.stime.length; i++) {
      t = this.stime[i];
      if (t<timefromstart || isNaN(t)) continue;
      t-=timefromstart;
      if (i%2) {
        this.gain.gain.linearRampToValueAtTime(1, it+t - this.rampperiod);
        this.gain.gain.linearRampToValueAtTime(0, it+t);
      } else {
        this.gain.gain.linearRampToValueAtTime(0, it+t);
        this.gain.gain.linearRampToValueAtTime(1, it+t + this.rampperiod);
      }
    }
    if (this.stime.length > 0) {
      this.endtime = it + this.stime[this.stime.length-1] - timefromstart;
      this.startStopWaiter();
    } else {
      this.stop();
    }
  }
  /*
    https://morsecode.world/international/timing.html
  */
  getDuration() {
    this.stime = [];
    this.itime = [];
    if (this.text.length <= 0) return 0;
    let d = Math.max(0, this.options.predelay), k = 0, inchar = false, qd = 0;
    this.itime.push(d);

    CWPlayer.internalTranslate(this.text).split('').forEach(c => {
      if (this.options.keyqual<1) {
        qd = 0.25*(1-this.options.keyqual)*Math.random(this.elperiod);
        qd-=qd/2;
      }
      switch (c) {
        case ' ':
          d += this.spperiod*3 + qd;
          inchar=false;
          this.itime.push(d);
          break;
        case '\t':
          this.itime.push(d); + qd
          d += this.spperiod*7 + this.options.ews + qd;
          inchar=false;
          this.itime.push(d);
          break;
        case '.':
        case '-':
          if (inchar) {
            //inter-element
            d += this.elperiod + qd;
          }
          this.stime.push(d);
          d += (c == '.' ? this.elperiod : 3*this.elperiod) + qd; // dit or dah
          this.stime.push(d);
          inchar=true;
          break;
      }
    });
    this.itime.push(d);
    return d;
  }
}

class MorsePlayer extends HTMLElement {
  static get TAG() { return "morse-player"; }
  static get SVG_INACTIF() { return 'svg_inactif'; }
  static observedAttributes = ['player', 'playing', 'paused', 'autoplay', 'wpm', 'effwpm', 'ews', 'tone', 'keyingquality', 'predelay', 'text', 'index', 'displayprogressbar', 'displayclearzone'];
  setters = [];

  static DEFAULT_OPTIONS = {
    ...CWPlayer.DEFAULT_OPTIONS,
    displayProgressBar : true,
    displayClearZone : false
  };

  constructor(...args) {
    super();
    this.enumerateSetters();
    let options = null;
    for (const arg of args) {
      if (arg instanceof CWPlayer) {
        this.cwplayer = arg;
      } else if (typeof arg === 'object') {
        let aks = Object.keys(arg);
        if (Object.keys(MorsePlayer.DEFAULT_OPTIONS).some(k => aks.includes(k))) {
          options = arg
        }
      }
    }
    this.init(options);
  }
  init(options) {
    this.options = {...MorsePlayer.DEFAULT_OPTIONS, ...options};
    let defaultkeys = Object.keys(MorsePlayer.DEFAULT_OPTIONS);
    // suppression des options invalides
    Object.keys(this.options).forEach(k => {
      if (!defaultkeys.includes(k)) delete this.options[k];
    });
    if (!this.cwplayer) {
      this.cwplayer = new CWPlayer(this.options);
    } else {
      this.cwplayer.init(this.options);
    }
    // suppression des options propres à CWPlayer
    this.options = {...this.options};
    defaultkeys = Object.keys(CWPlayer.DEFAULT_OPTIONS);
    Object.keys(this.options).forEach(k => {
      if (defaultkeys.includes(k)) delete this.options[k];
    });
  }
  enumerateSetters() {
    this.setters = Object.entries(Object.getOwnPropertyDescriptors(Reflect.getPrototypeOf(this)))
    .filter(e => typeof e[1].set === 'function' && e[0] !== '__proto__')
    .map(e => e[0]);
  }
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    // https://stackoverflow.com/a/54355963
    let slot = document.createElement('slot') ;
    slot.style.display = 'none';
    slot.addEventListener('slotchange', (function(e) {
      let nodes = slot.assignedNodes();
      let innertext = nodes[0].nodeValue;
      if (innertext.trim().length>0) {
        this.cwplayer.Text = innertext.trim();
      }
    }).bind(this));
    shadow.appendChild(slot);   

    const wrapper = document.createElement("div");
    wrapper.id="player";

    const czwrapper = document.createElement("div");
    czwrapper.id="czwrapper";
    const clearzone = document.createElement("table");
    clearzone.id="clearzone";
    clearzone.insertRow();
    clearzone.insertRow();
    czwrapper.appendChild(clearzone);

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");

    style.textContent = `
      :host {
        display: block;
      }
      :root {
        --btn-fill-color: #000;
      }
      #player {
        display: flex;
      }
      #player button {
        width: 32px;
        height: 28px;
        vertical-align: top;
        margin-bottom: 0px;
        padding: 2px 0 0 0;
        border-radius: 3px;
        border-width: 1px;
        fill: var(--btn-fill-color);
      }
      .svg_inactif {
        --btn-fill-color: grey;
        fill: var(--btn-fill-color);
      }
      .autoplay path {
        animation: blinker 1s linear infinite;
      }
      @keyframes blinker {
        65% { fill: var(--btn-fill-color); }
        70% { fill: #01ba11; }
      }
      #prgcont {
        display: inline-block;
        flex-grow: 1;
        user-select: none;
        margin-left: 5px;
      }
      .progress-bar {
        height: 25px;
        background-color: #ddd;
        border-radius: 2px;
        position:relative;
        top: 2px;
        overflow-x: hidden;
      }
      .progress {
        height: 100%;
        border-radius: 2px;
        background: #49aade/*linear-gradient(to right, #ffbf00 0%, #ff007f 100%)*/;
        width: 0%;
        position:relative;
      }
      .progress-bar center {
        position:absolute;
        left:0;
        right:0;
        top:0;
        bottom:0;
        margin:auto;
        margin-top: 3px;
      }
      .progress-bar span {
        font-family: sans-serif;
        font-size: inherit;
      }
      #czwrapper {
        background-color: #ccc;
        border-left: solid 2px #ccc;
        overflow: hidden;
        margin-left:auto;
        margin-right:auto;
        text-align:right;
        overflow:hidden;
        white-space: nowrap;
      }
      #clearzone {
        display: none;
        background-color: #ccc;
        overflow: hidden;
        float:right;
        font-size: 0.8em;
        font-family: monospace;
      }
      #clearzone td {
        background-color: #f8f8f8;
        text-align: center;
        min-width: 30px;
      }
      .lastchar {
        background-color: yellow !important;
      }
    `;

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    shadow.appendChild(czwrapper);
    wrapper.innerHTML = `
      <div>
        <button id="btnstop" title="stop playing" class="svg_inactif" disabled>
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 20 20">
            <rect width="16" height="16" x="2" y="2" rx="1" ry="1"/>
          </svg>
        </button>
        <button id="btnplay" title="start playing">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="-10 -5 120 120">
            <path d="M 13.677242369053593 5.970459221108368 L 99.32275763094641 55.02954077889163 C 103.6613788154732 57.514770389445815 103.50196896806634 62.18351020967654 99.00393793613266 64.36702041935308 L 13.996062063867347 105.63297958064692 C 9.498031031933674 107.81648979032346 5 105 5 100 L 5 11 C 5 6 9.338621184526797 3.485229610554184 13.677242369053593 5.970459221108368 Z" />
          </svg>
        </button>
        <button id="btnpause" title="pause playing" class="svg_inactif" disabled>
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 20 20">
            <rect width="5" height="15" x="3" y="2" rx="1" ry="1"/>
            <rect width="5" height="15" x="12" y="2" rx="1" ry="1"/>
          </svg>
        </button>
      </div>
      <div id="prgcont">
        <div class="progress-bar">
          <div id="playperc" class="progress"></div>
          <center><span id="playtime"></span></center>
        </div>
      </div>`;
    this.btnstop = this.shadowRoot.getElementById('btnstop');
    this.btnplay = this.shadowRoot.getElementById('btnplay');
    this.btnpause = this.shadowRoot.getElementById('btnpause');
    this.playperc = this.shadowRoot.getElementById('playperc');
    this.playtime = this.shadowRoot.getElementById('playtime');
    this.prgcont = this.shadowRoot.getElementById('prgcont');
    this.clearzone = clearzone;
    this.czwrapper = czwrapper;

    this.cwplayer.addEventListener('play', () => {
      this.updateButtonsState(true);
      this.updateDisplayTime();
    });
    this.cwplayer.addEventListener('pause', this.updateButtonsState.bind(this));
    this.cwplayer.addEventListener('stop', () => {
      this.updateButtonsState();
      this.updateClearZone();
    });
    this.cwplayer.addEventListener('parameterchanged', () => {
      this.updateDisplayTime();
      this.updateButtonsState();
    });

    this.cwplayer.addEventListener('indexchanged', () => {
      if (!this.cwplayer.Playing && !this.cwplayer.Paused) this.updateDisplayTime();
      this.updateButtonsState();
      this.updateClearZone();
    });
    this.btnplay.onclick = this.play.bind(this);
    this.btnpause.onclick = this.pause.bind(this);
    this.btnstop.onclick = this.stop.bind(this);
    this.btnplay.oncontextmenu = () => {
        this.cwplayer.AutoPlay = !this.cwplayer.AutoPlay;
        if (this.cwplayer.AutoPlay) {
          this.btnplay.classList.add('autoplay');
          this.btnplay.title = 'automatically start playing when text change';
        } else {
          this.btnplay.classList.remove('autoplay');
          this.btnplay.title = 'start playing';
        }
        return false;
    }
    document.addEventListener("mouseup", this.mouseup.bind(this));
    this.prgcont.addEventListener("mousedown", (e) => {
      let elem = (e.target || e.srcElement);
      if (elem != this.prgcont && !this.prgcont.contains(elem)) return;
      if (!this.prgcontrect) {
        this.prgcontrect = this.prgcont.getBoundingClientRect();
      }
      this.progresschanging = true;
      this.mousemove(e);
    });
    document.addEventListener("mousemove", this.mousemove.bind(this));

    if (!this.options.displayProgressBar) this.prgcont.style.display='none';
    if (this.options.displayClearZone) this.clearzone.style.display='table';

    if (this.innerHTML?.trim().length>0) {
      this.cwplayer.Text = this.innerHTML.trim();
    }
    
    this.updateDisplayTime();
    this.updateButtonsState();
    this.updateClearZone();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    let setter = this.setters?.find(p => p.toLowerCase() == name?.toLowerCase());
    if (setter) {
      this[setter] = newValue;
    }
  }

  get Player() { return this.cwplayer; }

  get Playing() { return this.cwplayer.Playing; }
  set Playing(value) { this.cwplayer.Playing = value; }
  get Paused() { return this.cwplayer.Paused; }
  set Paused(value) { this.cwplayer.Paused = value; }
  get AutoPlay() { return this.cwplayer.AutoPlay; }
  set AutoPlay(value) { this.cwplayer.AutoPlay = value; }
  get WPM() { return this.cwplayer.WPM; }
  set WPM(value) { this.cwplayer.WPM = value; }
  get EffWPM() { return this.cwplayer.EffWPM; }
  set EffWPM(value) { this.cwplayer.EffWPM = value; }
  get EWS() { return this.cwplayer.EWS; }
  set EWS(value) { this.cwplayer.EWS = value; }
  get Tone() { return this.cwplayer.Tone; }
  set Tone(value) { this.cwplayer.Tone = value; }
  get KeyingQuality() { return this.cwplayer.KeyingQuality; }
  set KeyingQuality(value) { this.cwplayer.KeyingQuality = value; }
  get PreDelay() { return this.cwplayer.PreDelay; }
  set PreDelay(value) { this.cwplayer.PreDelay = value; }
  get Text() { return this.cwplayer.Text; }
  set Text(value) { this.cwplayer.Text = value; }
  get Index() { return this.cwplayer.Index; }
  set Index(value) { this.cwplayer.Index = value; }
  get CurrentTime() { return this.cwplayer.CurrentTime; }
  set CurrentTime(value) { this.cwplayer.CurrentTime = value; }
  get TotalTime() { return this.cwplayer.TotalTime; }
  set TotalTime(value) { this.cwplayer.TotalTime = value; }

  get DisplayProgressBar() { return this.options.displayProgressBar; }
  set DisplayProgressBar(value) {
    this.options.displayProgressBar = CWPlayer.parsebool(value);
    if (this.prgcont) {
      this.prgcont.style.display = this.options.displayProgressBar ? 'block' : 'none';
      this.cwplayer.fireEvent('parameterchanged', 'DisplayProgressBar');
    }
  }
  get DisplayClearZone() { return this.options.displayClearZone; }
  set DisplayClearZone(value) {
    this.options.displayClearZone = CWPlayer.parsebool(value);
    if (this.clearzone) {
      this.updateClearZone();
      this.clearzone.style.display = this.options.displayClearZone ? 'table' : 'none';
      this.cwplayer.fireEvent('parameterchanged', 'DisplayClearZone');
    }
  }

  async playBoop() { await this.cwplayer.playBoop(); }
  async play(text) {
    [...document.querySelectorAll(MorsePlayer.TAG)].forEach(ma => {
      if (ma.Player != this.cwplayer) ma.Player?.pause();
    });
    await this.cwplayer.play(text);
  }
  pause() {
    this.cwplayer.pause();
  }
  stop() {
    this.cwplayer.stop();
  }
  
  addEventListener(evtname, cb) { this.cwplayer.addEventListener(evtname, cb); }
  on(evtname, cb) { this.cwplayer.addEventListener(evtname, cb); }
  removeEventListener(evtname, cb=null) { this.cwplayer.removeEventListener(evtname, cb); }

  mouseup() {
    this.progresschanging = false;
  }
  mousemove(e) {
    if (!this.progresschanging || !this.cwplayer || this.cwplayer.TotalTime <= 0) return;
    let clientX = e.clientX ?? (e?.touches?.length>0?e.touches[0].clientX:0);
    let perc = Math.min(this.prgcontrect.width, Math.max(0, clientX - this.prgcontrect.left))/this.prgcontrect.width;
    this.cwplayer.CurrentTime = perc * this.cwplayer.TotalTime;
  }

  formatTime(t) {
    let tf = (Math.floor(t/60)+"").padStart(2, '0') + ':';
    let s = Math.round(10*(t%60))/10;
    if (s<10) tf += '0';
    s = s+"";
    if (s.indexOf('.') < 0) s+='.0';
    return tf+s;
  }
  updateDisplayTime() {
    this.playperc.style.width = (100*this.cwplayer.CurrentTime/this.cwplayer.TotalTime)+'%';
    this.playtime.innerHTML = `${this.formatTime(this.cwplayer.CurrentTime)} / ${this.formatTime(this.cwplayer.TotalTime)}`;
    if (this.cwplayer.Playing || this.cwplayer.Paused) requestAnimationFrame(this.updateDisplayTime.bind(this));
  }
  updateButtonsState(en_stop, en_play, en_pause) {
    let playing = this.cwplayer.Playing;
    let paused = this.cwplayer.Paused;
    let havecontent = this.cwplayer.TotalTime > 0;

    this.btnstop.disabled = typeof en_stop === 'boolean' ? !en_stop : !havecontent || this.cwplayer.CurrentTime <= 0;
    this.btnplay.disabled = typeof en_play === 'boolean' ? !en_play : !havecontent || playing;
    this.btnpause.disabled = typeof en_pause === 'boolean' ? !en_pause : !havecontent || paused || !playing;
    
    let applyClass = (btn) => {
      if (btn.disabled) {
        btn.classList.add(MorsePlayer.SVG_INACTIF);
      } else {
        btn.classList.remove(MorsePlayer.SVG_INACTIF);
      }
    }
    applyClass(this.btnstop);
    applyClass(this.btnplay);
    applyClass(this.btnpause);
  }
  updateClearZone() {
    if (!this.options.displayClearZone) return;
    let playing = this.cwplayer.Playing;
    let idx = this.cwplayer.Index+1;
    if (idx<=0) {
      idx = this.cwplayer.Text.length;
    }
    let trc = this.clearzone.rows[0];
    let trm = this.clearzone.rows[1];
    trc.innerHTML = trm.innerHTML = '';
    let text = this.cwplayer.Text.substring(0, idx).split('');
    text.forEach((c,i) => {
      let lastcell = playing && i == text.length-1;
      let cell = trc.insertCell();
      if (lastcell) cell.classList.add('lastchar');
      cell.innerHTML = c;
      cell = trm.insertCell();
      if (lastcell) cell.classList.add('lastchar');
      cell.innerHTML = CWPlayer.translate(c);
    });
  }
}

customElements.define(MorsePlayer.TAG, MorsePlayer);
