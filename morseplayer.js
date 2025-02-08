
// Polyfill
if (typeof AudioParam.prototype.cancelAndHoldAtTime !== 'function') {
  if (typeof AudioParam.prototype.cancelValuesAndHoldAtTime !== 'function') {
    // Firefox
    AudioParam.prototype.cancelAndHoldAtTime = function (cancelTime) {
      const audioParam = this;
      const valueAtCancelTime = audioParam.getValueAtTime ? audioParam.getValueAtTime(cancelTime) : audioParam.value;

      audioParam.cancelScheduledValues(cancelTime);
      audioParam.setValueAtTime(valueAtCancelTime, cancelTime);
    };
  } else {
    // Chrome <57
    AudioParam.prototype.cancelAndHoldAtTime = AudioParam.prototype.cancelValuesAndHoldAtTime;
  }
}

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
    '!' : '-.-.--', // '---.',
    '?' : '..--..',
    '\u00b6' : '.-.-..',
    '&' : '.-...'
  };
  static DEFAULT_OPTIONS = {
    wpm : 20,
    effwpm : 20,
    tone : 800,
    keyqual : 1,
    ews : 0,
    predelay : 0,
    autoplay : false,
    volume : 1,
    qrn: 0,
    no_noise: false
  };
  elperiod = 0.06; // 20WPM.
  spperiod = 0.06;
  rampperiod = 0.005;
  constructor(options) {
    this.text = '';
    this.textarray = [];
    this.curti = -1;
    this.endtime = this.starttime = this.lastpausetime = this.totalpausetime = this.totaltime = 0;
    this.stime = [];
    this.recording = this.booping = this.playing = this.paused = false;
    this.events = {};
    this.onplayend = null;
    this.options = {...CWPlayer.DEFAULT_OPTIONS};
    this.init(options);
  }
  init(options) {
    options = {...CWPlayer.DEFAULT_OPTIONS, ...options};
    let defaultkeys = Object.keys(CWPlayer.DEFAULT_OPTIONS);
    // suppression des options invalides
    Object.keys(options).forEach(k => {
      if (!defaultkeys.includes(k)) delete options[k];
    });
    this.WPM = options.wpm;
    this.EffWPM = options.effwpm;
    this.Tone = options.tone;
    this.EWS = options.ews;
    this.PreDelay = options.predelay;
    this.AutoPlay = options.autoplay;
    this.Volume = options.volume;
    this.KeyingQuality = options.keyqual;
    this.QRN = options.qrn;
    this.options.no_noise = !!options.no_noise;
  }

  /*CONSTANTES*/
  static get MIN_WPM() { return 1; }
  static get MAX_WPM() { return 60; }
  static get MIN_EWS() { return 0; }
  static get MAX_EWS() { return 10; }
  static get MIN_TONE() { return 100; }
  static get MAX_TONE() { return 5000; }
  static get MIN_KEYQUAL() { return 0.5; }
  static get MAX_KEYQUAL() { return 1; }
  static get MIN_QRN() { return 0; }
  static get MAX_QRN() { return NoiseGainNode.MAX_NOISE; }
  /*FIN CONSTANTES*/

  get Options() { return {...this.options}; }
  set Options(options) { this.init(options); }

  get WPM() {
    return Math.round(6 / (5 * this.elperiod));
  }
  set WPM(value) {
    value = CWPlayer.parseint(value);
    value = Math.min(CWPlayer.MAX_WPM, Math.max(CWPlayer.MIN_WPM, value));
    if (this.options.wpm == value) return;
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
      if (this.playing) {
        // reschedule à partir du début du symbole courant
        this.scheduleFromCurrentSymbol();
      }
    }
    this.fireEvent('parameterchanged', 'WPM');
  }
  get EffWPM() {
    return Math.round(60/(19*this.spperiod+31*this.elperiod));
  }
  set EffWPM(value) {
    value = CWPlayer.parseint(value);
    value = Math.min(CWPlayer.MAX_WPM, Math.max(CWPlayer.MIN_WPM, value));
    if (this.options.effwpm == value) return;
    this.options.effwpm = value;
    if (this.WPM<value) {
      this.WPM = value;
    }
    this.spperiod = ((60/value)-31*this.elperiod)/19;
    this.totaltime = this.getDuration();
    if (this.playing) {
      // reschedule à partir du début du symbole courant
      this.scheduleFromCurrentSymbol();
    }
    this.fireEvent('parameterchanged', 'EffWPM');
  }
  get EWS() { return this.options.ews; }
  set EWS(value) {
    value = CWPlayer.parsefloat(value);
    value = Math.min(CWPlayer.MAX_EWS, Math.max(CWPlayer.MIN_EWS, value));
    if (this.options.ews == value) return;
    this.options.ews = value;
    this.totaltime = this.getDuration();
    if (this.playing) {
      // reschedule à partir du début du symbole courant
      this.scheduleFromCurrentSymbol();
    }
    this.fireEvent('parameterchanged', 'EWS');
  }
  get Tone() { return this.options.tone; }
  set Tone(value) {
    value = CWPlayer.parseint(value);
    value = Math.min(CWPlayer.MAX_TONE, Math.max(CWPlayer.MIN_TONE, value));
    if (value == this.options.tone && value == this.osc?.frequency?.value) return;
    this.options.tone = value;
    if (this.context) {
      this.osc.frequency.setValueAtTime(value, this.context.currentTime);
    }
    this.fireEvent('parameterchanged', 'Tone');
  }
  get Volume() { return this.options.volume; }
  set Volume(value) {
    value = CWPlayer.parsefloat(value);
    value = Math.min(1, Math.max(0, value));
    if (value == this.options.volume && value == this.master?.gain?.value) return;
    this.options.volume = value;
    if (this.context) {
      this.setMasterVolume();
    }
    this.fireEvent('parameterchanged', 'Volume');
  }
  get KeyingQuality() { return this.options.keyqual; }
  set KeyingQuality(value) {
    value = CWPlayer.parsefloat(value);
    value = Math.min(CWPlayer.MAX_KEYQUAL, Math.max(CWPlayer.MIN_KEYQUAL, value));
    if (this.options.keyqual == value) return;
    this.options.keyqual = value;
    this.totaltime = this.getDuration();
    if (this.playing) {
      // reschedule à partir du début du symbole courant
      this.scheduleFromCurrentSymbol();
    }
    this.fireEvent('parameterchanged', 'KeyingQuality');
  }
  get QRN() { return this.options.qrn; }
  set QRN(value) {
    value = CWPlayer.parsefloat(value);
    value = Math.min(CWPlayer.MAX_QRN, Math.max(CWPlayer.MIN_QRN, value));
    if (value == this.options.qrn && value == this.noise?.quantity?.value) return;
    this.options.qrn = value;
    if (this.context && this.playing && this.noise) {
      this.noise.quantity.value = value;
    }
    this.fireEvent('parameterchanged', 'QRN');
  }
  get PreDelay() { return this.options.predelay; }
  set PreDelay(value) {
    value = CWPlayer.parseint(value);
    value = Math.max(0, value);
    if (this.options.predelay == value) return;
    this.options.predelay = value;
    this.totaltime = this.getDuration();
    if (this.playing) {
      // reschedule à partir du début du symbole courant
      this.scheduleFromCurrentSymbol();
    }
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
  get Recording() { return this.recording; }
  get TextArray() { return this.textarray; }
  get Text() { return this.text; }
  set Text(value) {
    value = CWPlayer.cleanText(value ?? '');
    let oldtext = this.text;
    if (value == oldtext) return;
    // si on modifie le texte qui a déjà été joué on remet la lecture à 0
    if (this.curti>=0 && (value.length<=this.curti || value.substring(0, this.curti) != this.text.substring(0, this.curti))) {
      this.text = value;
      this.updateTextArray();
      this.totaltime = this.getDuration();
      this.fireEvent('parameterchanged', 'Text');
      this.Index = -1;
    } else {
      this.text = value;
      this.updateTextArray();
      this.totaltime = this.getDuration();
      this.fireEvent('parameterchanged', 'Text');
      this.fireEvent('indexchanged', this.curti);
      if (this.playing) {
        //this.itime.findIndex(s => s >= this.context.currentTime + 0.100);
        //let startindex = this.curti+2;
        let startindex = Math.min(this.curti+2, CWPlayer.sharedStart(oldtext, value).length);
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
    value = Math.max(-1, Math.min(this.text.length, value));
    if (value == this.curti) return;
    this.curti = value;
    this.totalpausetime = 0;
    let now = this.context?.currentTime ?? 0;
    let time = value<0 ? 0 : this.itime[value];
    this.starttime = now-time;
    this.lastpausetime = now;
    this.fireEvent('indexchanged', this.curti);
    if (this.playing) {
      this.schedule(time);
    }
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
    this.fireEvent('indexchanged', this.curti);
    if (this.playing) {
      this.schedule(value);
    }
  }

  fireEvent(evtname, args) {
    if (!this.events[evtname]) return;
    this.events[evtname].forEach(evt => {
      try {
        evt.func(args);
      } catch(e) {
        console.error(e);
      }
      if (evt.once) this.removeEventListener(evtname, evt.func);
    });
  }
  addEventListener(evtname, cb, once=false) {
    if (typeof cb !== 'function') return;
    if (!this.events[evtname]) this.events[evtname] = [];
    this.events[evtname].push({'func':cb, 'once':once});
  }
  on(evtname, cb) { this.addEventListener(evtname, cb, true); }
  removeEventListener(evtname, cb=null) {
    if (typeof evtname === 'function') {
      cb = evtname;
      Object.keys(this.events).forEach(k => {
        this.events[k] = this.events[k].filter(cb2 => cb2.func!==cb);
      });
    } else {
      if (!this.events[evtname]) return;
      if (!cb) {
        delete this.events[evtname];
      } else {
        this.events[evtname] = this.events[evtname].filter(cb2 => cb2.func!==cb);
      }
    }
  }
  static parsebool(value) { return (typeof value === 'string') ? value.trim().toLowerCase() == 'true' : !!value; }
  static parseint(value) { value = (typeof value === 'string') ? parseInt(value.trim(), 10) : value; return isNaN(value) ? 0 : value; }
  static parsefloat(value) { value = (typeof value === 'string') ? parseFloat(value.trim()) : value; return isNaN(value) ? 0 : value; }
  static cleanText(text) {
    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replaceAll(/((\r?\n)|\t)+/g, '  ') // retour à la ligne/tabulation : deux espaces
      .replaceAll(/[^A-Z0-9/+=.,"$'(){}[\]\-:;@_!?¶& ]/g, '?')
      .trim()
      /*.replaceAll(/\s+/g, ' ')*/;
    let i=-1, j=0, k=0;
    do {
      i = text.indexOf('{', i+1);
      if (i>=0) {
        i++;
        j = text.indexOf('}', i);
        k = text.indexOf('{', i);
        if (k >= 0 && j>k) {
          text = text.substring(0, i-1)+text.substring(i);
          i = k;
        } else if (j>=0) {
          i = j+1;
        } else {
          text += '}';
          i-=2;
        }
      }
    } while (i>=0);
    let r = [...text.matchAll(/({[^{}]*})/g)].map(e => e[0]);//.replaceAll(/[^a-z{}]/g, '')
    r.forEach(t => text = text.replaceAll(t, t.replaceAll(/[^A-Z{}]/g, '')));
    return text;
  }
  static translate(text) {
    text = CWPlayer.cleanText(text);
    return CWPlayer.internalTranslate(text);
  }
  static isSpace(c) { return c == ' ' || c == '\t'; }
  static internalTranslate(text) {
    let cwtext = '';
    let prosign = false;
    for (let i=0; i<text.length; i++) {
      if (text[i] == '{') {
        prosign = true;
        continue;
      } else if (text[i] == '}') {
        prosign = false;
        continue;
      }
      if (!prosign && i>0 && !CWPlayer.isSpace(text[i-1]) && !CWPlayer.isSpace(text[i])) cwtext += ' '; // on rajoute un espace après tout caractère (sauf si le celui-ci ou le courant est un espace)
      cwtext += CWPlayer.morse[text[i]] ?? CWPlayer.morse['?'];
    }
    return cwtext;
  }

  /* pour annuler le délai : 
  let controller = new window.AbortController();
  let signal = controller.signal;
  CWPlayer.delay(5, signal).then(() => {console.log('will never happen')});
  controller.abort(); <-- Ici
  */
  static async delay(s, signal = null) {
    return new Promise(res => {
      let toid = setTimeout(res, s*1000);
      signal?.addEventListener('abort', () => {
        clearInterval(toid);
      });
    });
  }
  static sharedStart(...args){
    let A=args.sort(), 
    a1=A[0], a2=A[A.length-1], L=a1.length, i=0;
    while(i<L && a1.charAt(i) === a2.charAt(i)) i++;
    return a1.substring(0, i);
  }
  static rand(...args) {
    let min = 0, max = 1;
    if (args.length >= 2) {
      min = args[0];
      max = args[1];
    } else if (args.length >= 1) {
      max = args[0];
    }
    return Math.random() * (max - min) + min;
  }
  setMasterVolume() {
    // volume log
    this.master.gain.setValueAtTime(Math.pow(this.options.volume*10, 2)/100, this.context.currentTime);
  }

  async initAudio(offline = false) {
    if (!offline) {
      if (this.recording) return;
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    } else {
      this.context = new OfflineAudioContext(2, 44100 * (this.totaltime+0.5), 44100);
    }
    this.osc = this.context.createOscillator();
    this.gain = this.context.createGain();
    this.osc.connect(this.gain);
    let termnode = this.gain;
    if (!this.options.no_noise) {
      this.noise = new NoiseGainNode(this.context);
      await this.noise.initAudio();
      this.noise.quantity.value = 0;
      termnode = this.noise;
      this.gain.connect(this.noise);
    }
    this.gain.gain.value = 0;
    this.osc.frequency.value = this.options.tone;
    if (!offline) {
      this.master = this.context.createGain();
      this.setMasterVolume();
      termnode.connect(this.master);
      this.master.connect(this.context.destination);
    } else {
      termnode.connect(this.context.destination);
    }
    this.osc.start();
  }
  async playBoop() {
    if (this.recording) return;
    else if (this.playing) {
      this.stop();
    } else if (!this.context) {
      await this.initAudio();
    }
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
    if (this.noise) {
      this.noise.quantity.value = 0;
    }
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
      this.fireEvent('indexchanged', this.curti);
    }
    if (this.playing) {
      this.playing = false;
      this.gain.gain.cancelAndHoldAtTime(this.context.currentTime);
      this.stopSound();
      if (this.onplayend) {
        try {
          this.onplayend();
        } catch(e) {
          console.error(e);
        }
        this.onplayend = null;
      }
      /*try {
        this.gain.disconnect(this.context.destination);
      } catch(e) {}*/
    }
    this.fireEvent(pause?'pause':'stop');
  }
  pause() {
    if (!this.playing || this.booping || this.recording) return;
    this.lastpausetime = this.context.currentTime;
    return this.stop(true);
  }
  async play(text) {
    return new Promise(async res => {
      if (this.playing || this.booping || this.recording) {
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
        await this.initAudio();
      }
      if (this.starttime==0) {
        this.totalpausetime = 0;
        this.lastpausetime = this.starttime = this.context.currentTime+Number.EPSILON; // au premier coup -> après initaudio currentTime vaut 0
      }
      this.gain.gain.value = 0;
      //this.gain.connect(this.context.destination);
  
      this.playing = true;
      this.paused = false;
      this.fireEvent('play');
      this.schedule(this.lastpausetime-this.starttime-this.totalpausetime);
      if (this.lastpausetime > 0) {
        this.totalpausetime += (this.context.currentTime-this.lastpausetime);
        this.lastpausetime = 0;
      }
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
        this.fireEvent('indexchanged', curti);
      }
      await CWPlayer.delay(0.01);
    }
    if (this.playing && this.localTime == localTime) {
      this.stop();
    }
  }
  scheduleFromCurrentSymbol() {
    // reschedule à partir du début du symbole courant
    this.totalpausetime = 0;
    let now = this.context?.currentTime ?? 0;
    let time = this.curti<0 ? 0 : this.itime[this.curti];
    this.starttime = now-time;
    this.lastpausetime = now;
    this.schedule(time);
  }
  async schedule(timefromstart, startindex) {
    if (!this.context || (!this.playing && !this.recording)) return;
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
      this.gain.gain.cancelAndHoldAtTime(it);
      timefromstart-=this.stopSound();
    } else {
      this.gain.gain.cancelAndHoldAtTime(this.starttime+this.totalpausetime+this.itime[startindex?startindex-1:0]);
    }
    if (this.noise) {
      this.noise.quantity.value = this.options.qrn;
    }
    let t=0;
    for (let i=startindex; i<this.stime.length; i++) {
      t = this.stime[i] - timefromstart;
      if (t<0 || isNaN(t)) continue;
      if (i%2) {
        if (t>this.rampperiod) this.gain.gain.linearRampToValueAtTime(1, it+t - this.rampperiod);
        this.gain.gain.linearRampToValueAtTime(0, it+t);
      } else {
        this.gain.gain.linearRampToValueAtTime(0, it+t);
        this.gain.gain.linearRampToValueAtTime(1, it+t + this.rampperiod);
      }
    }
    if (this.stime.length > 0) {
      this.endtime = it + this.stime[this.stime.length-1] - timefromstart;
      await this.startStopWaiter();
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
    let d = Math.max(0, this.options.predelay), k = 0, inchar = false, qf = 1;
    this.itime.push(d);

    CWPlayer.internalTranslate(this.text).split('').forEach(c => {
      if (this.options.keyqual<1) {
        qf = 1 + (1-this.options.keyqual) * CWPlayer.rand(-0.5, +0.5);
      }
      switch (c) {
        case ' ':
          d += qf*this.spperiod*3;
          inchar=false;
          this.itime.push(d);
          break;
        case '\t':
          this.itime.push(d);
          d += qf*this.spperiod*7 + this.options.ews;
          inchar=false;
          this.itime.push(d);
          break;
        case '.':
        case '-':
          if (inchar) {
            //inter-element
            d += qf*this.elperiod;
          }
          this.stime.push(d);
          d += qf*(c == '.' ? this.elperiod : 3*this.elperiod); // dit or dah
          this.stime.push(d);
          inchar=true;
          break;
      }
    });
    this.itime.push(d);
    return d;
  }
  updateTextArray() {
    let prosign = false;
    let tmparr = [];
    this.textarray = this.text.split('').reduce((acc, cur) => {
      if (cur == '{') {
        prosign = true;
      } else if (cur == '}') {
        prosign = false;
        if(tmparr.length) acc.push(tmparr.join(''));
        tmparr=[];
      }
      else {
        (prosign?tmparr:acc).push(cur);
      }
      return acc;
    }, []);
  }
  async renderToFile(text=null) {
    if (this.playing) this.stop();
    this.recording = true;
    this.fireEvent('play'); // permet de déclencher les évenements
    this.fireEvent('record');
    if (text) {
      this.Text = text;
    }
    try {
      await this.initAudio(true);
      this.schedule();
      let audioBuffer = await this.context.startRendering();

      const left = audioBuffer.getChannelData(0);

      // get WAV file bytes and audio params of your audio source
      const wavBytes = WAV.getBytes(left.buffer, {
        isFloat: true,       // floating point or 16-bit integer
        numChannels: 1,
        sampleRate: 44100,
      });
      const wav = new Blob([wavBytes], { type: 'audio/wav' });

      let url = URL.createObjectURL(wav);
      let a = document.createElement('a');
      a.href = url;
      a.download = "file.wav";
      document.body.appendChild(a);
      a.click();    
      a.remove();
    } catch (e) {
      alert('unable to save WAV file');
      console.error(e);
    } finally {
      this.recording = false;
      await this.initAudio();
      this.fireEvent('stop'); // permet de déclencher les évenements
    }
  }
}

// https://stackoverflow.com/a/62173861
class WAV {
  // Returns Uint8Array of WAV bytes
  static getBytes(buffer, options) {
    const type = options.isFloat ? Float32Array : Uint16Array;
    const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT;
  
    const headerBytes = WAV.getHeader(Object.assign({}, options, { numFrames }));
    const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);
  
    // prepend header, then add pcmBytes
    wavBytes.set(headerBytes, 0);
    wavBytes.set(new Uint8Array(buffer), headerBytes.length);
  
    return wavBytes;
  }
  
  // adapted from https://gist.github.com/also/900023
  // returns Uint8Array of WAV header bytes
  static getHeader(options) {
    const numFrames =      options.numFrames;
    const numChannels =    options.numChannels || 2;
    const sampleRate =     options.sampleRate || 44100;
    const bytesPerSample = options.isFloat? 4 : 2;
    const format =         options.isFloat? 3 : 1;
  
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numFrames * blockAlign;
  
    const buffer = new ArrayBuffer(44);
    const dv = new DataView(buffer);
  
    let p = 0;
  
    function writeString(s) {
      for (let i = 0; i < s.length; i++) {
        dv.setUint8(p + i, s.charCodeAt(i));
      }
      p += s.length;
    }
  
    function writeUint32(d) {
      dv.setUint32(p, d, true);
      p += 4;
    }
  
    function writeUint16(d) {
      dv.setUint16(p, d, true);
      p += 2;
    }
  
    writeString('RIFF');              // ChunkID
    writeUint32(dataSize + 36);       // ChunkSize
    writeString('WAVE');              // Format
    writeString('fmt ');              // Subchunk1ID
    writeUint32(16);                  // Subchunk1Size
    writeUint16(format);              // AudioFormat https://i.sstatic.net/BuSmb.png
    writeUint16(numChannels);         // NumChannels
    writeUint32(sampleRate);          // SampleRate
    writeUint32(byteRate);            // ByteRate
    writeUint16(blockAlign);          // BlockAlign
    writeUint16(bytesPerSample * 8);  // BitsPerSample
    writeString('data');              // Subchunk2ID
    writeUint32(dataSize);            // Subchunk2Size
  
    return new Uint8Array(buffer);
  }
}

class MorsePlayer extends HTMLElement {
  static get TAG() { return "morse-player"; }
  static get SVG_INACTIF() { return 'svg_inactif'; }
  static observedAttributes = ['player', 'playing', 'paused', 'autoplay', 'currenttime', 'wpm', 'effwpm', 'ews', 'tone', 'volume', 'keyingquality', 'predelay', 'text', 'index', 'progressbar', 'clearzone', 'configbutton', 'downloadbutton'];

  static DEFAULT_OPTIONS = {
    progressBar : true,
    clearZone : false,
    configButton : true,
    downloadButton : false,
    qrm: 0
  };

  static get MIN_QRM() { return 0; }
  static get MAX_QRM() { return 1; }
  
  constructor(...args) {
    super();
    this.enumerateSetters();
    this.qrmgenerator = new QRMGenerator();
    let options = null;
    for (const arg of args) {
      if (arg instanceof CWPlayer) {
        this.cwplayer = arg;
      } else if (typeof arg === 'object') {
        let aks = Object.keys(arg);
        if (Object.keys({...CWPlayer.DEFAULT_OPTIONS, ...MorsePlayer.DEFAULT_OPTIONS}).some(k => aks.includes(k))) {
          options = arg;
        }
      }
    }
    this.options = {...MorsePlayer.DEFAULT_OPTIONS};
    this.init(options);
  }
  init(options) {
    options = {...CWPlayer.DEFAULT_OPTIONS, ...MorsePlayer.DEFAULT_OPTIONS, ...options};
    let defaultkeys = Object.keys({...CWPlayer.DEFAULT_OPTIONS, ...MorsePlayer.DEFAULT_OPTIONS});
    // suppression des options invalides
    Object.keys(options).forEach(k => {
      if (!defaultkeys.includes(k)) delete options[k];
    });
    if (!this.cwplayer) {
      this.cwplayer = new CWPlayer(options);
    } else {
      this.cwplayer.init(options);
    }
    // suppression des options propres à CWPlayer
    options = {...options};
    defaultkeys = Object.keys(CWPlayer.DEFAULT_OPTIONS);
    Object.keys(options).forEach(k => {
      if (defaultkeys.includes(k)) delete options[k];
    });
    this.ProgressBar = options.progressBar;
    this.ClearZone = options.clearZone;
    this.ConfigButton = options.configButton;
    this.DownloadButton = options.downloadButton;
    this.QRM = options.qrm;
    this.mobile = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
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

    const configzone = document.createElement("div");
    configzone.id="configzone";
    const configzonecont = document.createElement("div");
    configzone.appendChild(configzonecont);
    let cfghtml = `<span><label for="val_WPM" title="speed (in words per minute)">WPM :</label><input id="val_WPM" type="number" min="${CWPlayer.MIN_WPM}" max="${CWPlayer.MAX_WPM}" step="1" title="speed (in words per minute)"></span>`;
    cfghtml += `<span><label for="val_EffWPM" title="effective (Farnsworth) speed (in words per minute)">Eff WPM :</label><input id="val_EffWPM" type="number" min="${CWPlayer.MIN_WPM}" max="${CWPlayer.MAX_WPM}" step="1" title="effective (Farnsworth) speed (in words per minute)"></span><BR>`;
    cfghtml += `<span><label for="val_EWS" title="extra space between words (in seconds)">Extra Word Space :</label><input id="val_EWS" type="number" min="${CWPlayer.MIN_EWS}" max="${CWPlayer.MAX_EWS}" step="0.1" title="extra space between words (in seconds)"></span><BR>`;
    cfghtml += `<span><label for="val_Tone" title="tone (in Hertz)">Tone :</label><input id="val_Tone" type="number" min="${CWPlayer.MIN_TONE}" max="${CWPlayer.MAX_TONE}" step="100" title="tone (in Hertz)"></span><BR>`;
    cfghtml += `<span><label for="val_KeyingQuality" title="keying quality">Keying Quality :</label><input id="val_KeyingQuality" type="range" min="${CWPlayer.MIN_KEYQUAL}" max="${CWPlayer.MAX_KEYQUAL}" step="0.1" title="keying quality"></span><BR>`;
    cfghtml += `<span><label for="val_QRN" title="QRN">QRN :</label><input id="val_QRN" type="range" min="${CWPlayer.MIN_QRN}" max="${CWPlayer.MAX_QRN}" step="0.05" title="QRN"></span><BR>`;
    cfghtml += `<span><label for="val_QRM" title="QRM (Traffic)">QRM/Traffic :</label><input id="val_QRM" type="range" min="${MorsePlayer.MIN_QRM}" max="${MorsePlayer.MAX_QRM}" step="0.05" title="QRM (Traffic)"></span><BR>`;
    cfghtml += `<span><label for="val_Volume" title="volume">Volume :</label><input id="val_Volume" type="range" min="0" max="1" step="0.01" title="volume"></span>`;
    configzonecont.innerHTML = cfghtml;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");

    style.textContent = `
      :host {
        display: block;
        font-family: sans-serif;
      }
      :root {
        --btn-fill-color: #000;
      }
      #player {
        display: flex;
        position: relative;
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
      #configzone {
        display: none;
        background-color: #ccc;
        padding: 2px;
        height: 127px; /* à cause de l'élement enfant scale */
        text-align: right;
      }
      #configzone>div {
        background-color: #f8f8f8;
        width: 280px;
        margin-left: auto;
        margin-right: 0;
        transform: scale(0.9);
        transform-origin: top right;
      }
      #configzone span, input {
        margin: 0 0 0 5px;
        padding: 0;
        white-space: nowrap;
      }
      #configzone input[type="number"] {
        width: 38px;
      }
      #configzone input[type="range"] {
        height: 15px;
      }
      #val_Tone {
        width: 45px !important;
      }
      #btnconfig, #btndownload {
        margin-left: 1px;
        padding: 2px 4px 0 4px;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        margin-top: 1px;
      }
      #btnconfig.opened {
        background-color: #ccc;
      }
      #btnconfig:hover .cfggear {
        fill: orange;
      }
      #btnconfig:hover .cfgpath {
        filter: drop-shadow(0px 0px 5px rgb(0 0 0 / 0.4));
      }
      #btnconfig:active .cfggear {
        fill: yellow;
      }
      #btnconfig:active .cfgpath {
        filter: drop-shadow(0px 0px 5px rgb(0 0 0 / 1));
      }
      #btndownload:hover path {
        fill: orange;
      }
      #btndownload.svg_inactif {
        cursor: default;
      }
      #btndownload.svg_inactif path {
        fill: lightgrey !important;
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
        font-size: 0.8em;
        font-family: monospace;
        user-select: none;
      }
      #clearzone td {
        background-color: #f8f8f8;
        text-align: center;
        min-width: 30px;
        cursor: pointer;
      }
      #clearzone td:hover {
        background-color: #e8e8e8;
      }
      .currentchar {
        background-color: yellow !important;
      }
      .cfggear {
        fill: #ddd;
      }
    `;

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    shadow.appendChild(configzone);
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
      </div>
      <a id="btndownload" href="#" title="save current morse sequence as wave file">
        <svg fill="#000000" height="20" width="20" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
        	 viewBox="0 0 471.2 471.2" xml:space="preserve">
        	<g>
        		<path d="M457.7,230.15c-7.5,0-13.5,6-13.5,13.5v122.8c0,33.4-27.2,60.5-60.5,60.5H87.5c-33.4,0-60.5-27.2-60.5-60.5v-124.8
        			c0-7.5-6-13.5-13.5-13.5s-13.5,6-13.5,13.5v124.8c0,48.3,39.3,87.5,87.5,87.5h296.2c48.3,0,87.5-39.3,87.5-87.5v-122.8
        			C471.2,236.25,465.2,230.15,457.7,230.15z"/>
        		<path d="M226.1,346.75c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4l85.8-85.8c5.3-5.3,5.3-13.8,0-19.1c-5.3-5.3-13.8-5.3-19.1,0l-62.7,62.8
        			V30.75c0-7.5-6-13.5-13.5-13.5s-13.5,6-13.5,13.5v273.9l-62.8-62.8c-5.3-5.3-13.8-5.3-19.1,0c-5.3,5.3-5.3,13.8,0,19.1
        			L226.1,346.75z"/>
        	</g>
        </svg>
      </a>
      <a id="btnconfig" href="#" title="open settings">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="-2 -2 58 58">
          <defs>
            <path id="ext" d="M51.22,21h-5.052c-0.812,0-1.481-0.447-1.792-1.197s-0.153-1.54,0.42-2.114l3.572-3.571
        		c0.525-0.525,0.814-1.224,0.814-1.966c0-0.743-0.289-1.441-0.814-1.967l-4.553-4.553c-1.05-1.05-2.881-1.052-3.933,0l-3.571,3.571
        		c-0.574,0.573-1.366,0.733-2.114,0.421C33.447,9.313,33,8.644,33,7.832V2.78C33,1.247,31.753,0,30.22,0H23.78
        		C22.247,0,21,1.247,21,2.78v5.052c0,0.812-0.447,1.481-1.197,1.792c-0.748,0.313-1.54,0.152-2.114-0.421l-3.571-3.571
        		c-1.052-1.052-2.883-1.05-3.933,0l-4.553,4.553c-0.525,0.525-0.814,1.224-0.814,1.967c0,0.742,0.289,1.44,0.814,1.966l3.572,3.571
        		c0.573,0.574,0.73,1.364,0.42,2.114S8.644,21,7.832,21H2.78C1.247,21,0,22.247,0,23.78v6.439C0,31.753,1.247,33,2.78,33h5.052
        		c0.812,0,1.481,0.447,1.792,1.197s0.153,1.54-0.42,2.114l-3.572,3.571c-0.525,0.525-0.814,1.224-0.814,1.966
        		c0,0.743,0.289,1.441,0.814,1.967l4.553,4.553c1.051,1.051,2.881,1.053,3.933,0l3.571-3.572c0.574-0.573,1.363-0.731,2.114-0.42
        		c0.75,0.311,1.197,0.98,1.197,1.792v5.052c0,1.533,1.247,2.78,2.78,2.78h6.439c1.533,0,2.78-1.247,2.78-2.78v-5.052
        		c0-0.812,0.447-1.481,1.197-1.792c0.751-0.312,1.54-0.153,2.114,0.42l3.571,3.572c1.052,1.052,2.883,1.05,3.933,0l4.553-4.553
        		c0.525-0.525,0.814-1.224,0.814-1.967c0-0.742-0.289-1.44-0.814-1.966l-3.572-3.571c-0.573-0.574-0.73-1.364-0.42-2.114
        		S45.356,33,46.168,33h5.052c1.533,0,2.78-1.247,2.78-2.78V23.78C54,22.247,52.753,21,51.22,21z M52,30.22z"/>
            <circle id="int" r="9" cy="27" cx="27"/>
            <mask id="myMask">
              <use xlink:href="#ext" fill="white"/>
              <use xlink:href="#int" fill="black"/>
            </mask>
          </defs>
          <g class="cfgpath">
            <use xlink:href="#ext" mask="url(#myMask)" stroke-width="1" stroke="black" class="cfggear"/>
            <use xlink:href="#int" stroke-width="1" stroke="black" fill="transparent"/>
          </g>
        </svg>
      </a>`;
    this.btnstop = this.shadowRoot.getElementById('btnstop');
    this.btnplay = this.shadowRoot.getElementById('btnplay');
    this.btnpause = this.shadowRoot.getElementById('btnpause');
    this.btnconfig = this.shadowRoot.getElementById('btnconfig');
    this.btndownload = this.shadowRoot.getElementById('btndownload');
    this.playperc = this.shadowRoot.getElementById('playperc');
    this.playtime = this.shadowRoot.getElementById('playtime');
    this.prgcont = this.shadowRoot.getElementById('prgcont');
    this.clearzone = clearzone;
    this.czwrapper = czwrapper;
    this.configzone = configzone;
    this.configfields = {};
    [...configzone.querySelectorAll('input')].filter(f => f.id.startsWith('val_')).forEach(f => this.configfields[f.id.substring(4)] = f );

    this.cwplayer.addEventListener('play', () => {
      this.qrmgenerator.setParams(Math.round(this.options.qrm*10), this.options.qrm);
      this.qrmgenerator.start();
      this.updateButtonsState(true);
      this.updateDisplayTime();
    });
    this.cwplayer.addEventListener('pause', () => {
      this.qrmgenerator.stop();
      this.updateButtonsState();
    });
    this.cwplayer.addEventListener('stop', () => {
      this.qrmgenerator.stop();
      this.updateButtonsState();
      this.updateClearZone();
    });
    this.cwplayer.addEventListener('parameterchanged', (name) => {
      this.updateFields(name);
      if (['WPM', 'EffWPM', 'EWS', 'KeyingQuality', 'PreDelay', 'Text'].includes(name)) {
        this.updateDisplayTime();
        this.updateButtonsState();
      }
      if (name === 'Text') {
        this.constructClearZone();
      }
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
    };
    this.btnconfig.onclick = () => {
      this.configzone.style.display = this.configzone.style.display == 'block' ? 'none' : 'block';
      this.btnconfig.classList.toggle('opened');
      return false;
    };
    this.btndownload.onclick = () => {
      if (this.TotalTime > 0) {
        this.cwplayer.renderToFile();
      }
      return false;
    };
    if (!this.mobile) {
      document.addEventListener("mouseup", this.mouseup.bind(this));
      this.prgcont.addEventListener("mousedown", this.mousedown.bind(this));
      document.addEventListener("mousemove", this.mousemove.bind(this));
    } else {
      this.prgcont.addEventListener("touchstart", this.mousedown.bind(this));
      document.addEventListener("touchend", this.mouseup.bind(this));
      document.addEventListener("touchcancel", this.mouseup.bind(this));
      document.addEventListener("touchmove", this.mousemove.bind(this));
    }
    document.addEventListener("keyup", (e) => {
      if (e.key === 'Escape' || (e.keyCode || e.which) == 27) this.mouseup();
    });
    Object.keys(this.configfields).forEach(k => {
      let evttype = ['Volume', 'QRN'].includes(k) ? 'input' : 'change';
      this.configfields[k].addEventListener(evttype, () => { this[k] = this.configfields[k].value; });
    });

    if (!this.options.progressBar) this.prgcont.style.display='none';
    if (this.options.clearZone) this.clearzone.style.display='table';
    if (!this.options.configButton) this.btnconfig.style.display='none';
    if (!this.options.downloadButton) this.btndownload.style.display='none';

    if (this.innerHTML?.trim().length>0) {
      this.cwplayer.Text = this.innerHTML.trim();
    }

    const csStartDragging = (e) => {
      this.czDragElement = e.srcElement;
      this.czMoves = 0;
      this.czMouseDown = true;
      this.czStartX = (e.pageX ?? e.touches[0]?.pageX ?? 0) - this.czwrapper.offsetLeft;
      this.czScrollLeft = this.czwrapper.scrollLeft;
    };
    
    const czStopDragging = (e) => {
      this.czMouseDown = false;
      if (this.czMoves > 2/* && this.czDragElement !== e.srcElement*/) this.czJustScrolled = true;
    };
    
    const czMove = (e) => {
      //e.preventDefault();
      if(!this.czMouseDown) { return; }
      this.czMoves++;
      const x = (e.pageX ?? e.touches[0]?.pageX ?? 0) - this.czwrapper.offsetLeft;
      const scroll = x - this.czStartX;
      this.czwrapper.scrollLeft = this.czScrollLeft - scroll;
    };

    if (!this.mobile) {
      this.czwrapper.addEventListener('mousemove', czMove, false);
      this.czwrapper.addEventListener('mousedown', csStartDragging, false);
      this.czwrapper.addEventListener('mouseup', czStopDragging, false);
      this.czwrapper.addEventListener('mouseleave', czStopDragging, false);
    } else {
      this.czwrapper.addEventListener('touchmove', czMove, false);
      this.czwrapper.addEventListener('touchstart', csStartDragging, false);
      this.czwrapper.addEventListener('touchend', czStopDragging, false);
      this.czwrapper.addEventListener('touchcancel', czStopDragging, false);
    }

    this.updateDisplayTime();
    this.updateButtonsState();
    this.constructClearZone();
    this.updateFields();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    let setter = this.setters?.find(p => p.toLowerCase() == name?.toLowerCase());
    if (setter) {
      this[setter] = newValue;
    }
  }

  get Player() { return this.cwplayer; }
  get Options() { return {...this.options, ...this.cwplayer.options}; }
  set Options(options) { this.init(options); }

  get Playing() { return this.cwplayer.Playing; }
  set Playing(value) { this.cwplayer.Playing = value; }
  get Recording() { return this.cwplayer.Recording; }
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
  get Volume() { return this.cwplayer.Volume; }
  set Volume(value) { 
    this.cwplayer.Volume = value;
    this.qrmgenerator.MaxVolume = value;
  }
  get KeyingQuality() { return this.cwplayer.KeyingQuality; }
  set KeyingQuality(value) { this.cwplayer.KeyingQuality = value; }
  get QRN() { return this.cwplayer.QRN; }
  set QRN(value) { this.cwplayer.QRN = value; }
  get QRM() { return this.options.qrm; }
  set QRM(value) {
    value = CWPlayer.parsefloat(value);
    value = Math.min(MorsePlayer.MAX_QRM, Math.max(MorsePlayer.MIN_QRM, value));
    if (value == this.options.qrm) return;
    this.options.qrm = value;
    this.qrmgenerator.setParams(Math.round(value*10), value);
    if (this.Playing && !this.qrmgenerator.Active) {
      this.qrmgenerator.start();
    }
    this.cwplayer.fireEvent('parameterchanged', 'QRM');
  }
  get PreDelay() { return this.cwplayer.PreDelay; }
  set PreDelay(value) { this.cwplayer.PreDelay = value; }
  get TextArray() { return this.cwplayer.TextArray; }
  get Text() { return this.cwplayer.Text; }
  set Text(value) { this.cwplayer.Text = value; }
  get Index() { return this.cwplayer.Index; }
  set Index(value) { this.cwplayer.Index = value; }
  get CurrentTime() { return this.cwplayer.CurrentTime; }
  set CurrentTime(value) { this.cwplayer.CurrentTime = value; }
  get TotalTime() { return this.cwplayer.TotalTime; }
  set TotalTime(value) { this.cwplayer.TotalTime = value; }

  get ProgressBar() { return this.options.progressBar; }
  set ProgressBar(value) {
    this.options.progressBar = CWPlayer.parsebool(value);
    if (this.prgcont) {
      this.prgcont.style.display = this.options.progressBar ? 'block' : 'none';
      this.cwplayer.fireEvent('parameterchanged', 'ProgressBar');
    }
  }
  get ClearZone() { return this.options.clearZone; }
  set ClearZone(value) {
    this.options.clearZone = CWPlayer.parsebool(value);
    if (this.clearzone) {
      this.constructClearZone();
      this.clearzone.style.display = this.options.clearZone ? 'table' : 'none';
      this.cwplayer.fireEvent('parameterchanged', 'ClearZone');
    }
  }
  get ConfigButton() { return this.options.configButton; }
  set ConfigButton(value) {
    this.options.configButton = CWPlayer.parsebool(value);
    if (this.btnconfig) {
      this.btnconfig.style.display = this.options.configButton ? 'block' : 'none';
      this.cwplayer.fireEvent('parameterchanged', 'ConfigButton');
    }
  }
  get DownloadButton() { return this.options.downloadButton; }
  set DownloadButton(value) {
    this.options.downloadButton = CWPlayer.parsebool(value);
    if (this.btndownload) {
      this.btndownload.style.display = this.options.downloadButton ? 'block' : 'none';
      this.cwplayer.fireEvent('parameterchanged', 'DownloadButton');
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
  on(evtname, cb) { this.cwplayer.on(evtname, cb); }
  removeEventListener(evtname, cb=null) { this.cwplayer.removeEventListener(evtname, cb); }

  mouseup() {
    this.progresschanging = false;
  }
  mousedown(e) {
    let elem = (e.target || e.srcElement);
    if (elem != this.prgcont && !this.prgcont.contains(elem)) return;
    if (!this.prgcontrect) {
      this.prgcontrect = this.prgcont.getBoundingClientRect();
    }
    this.progresschanging = true;
    this.mousemove(e);
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
  updateFields(name=null) {
    if (!name) {
      Object.keys(this.configfields).forEach(k => {
        this.configfields[k].value = this[k];
      });
    } else if (this.configfields[name]) {
      this.configfields[name].value = this[name];
    }
  }
  updateButtonsState(en_stop, en_play, en_pause) {
    let playing = this.cwplayer.Playing;
    let recording = this.cwplayer.Recording;
    let paused = this.cwplayer.Paused;
    let havecontent = this.cwplayer.TotalTime > 0;

    this.btnstop.disabled = recording || !(typeof en_stop === 'boolean' ? en_stop : havecontent && (playing || (paused && this.cwplayer.CurrentTime > 0)));
    this.btnplay.disabled = recording || (typeof en_play === 'boolean' ? !en_play : !havecontent || playing);
    this.btnpause.disabled = recording || (typeof en_pause === 'boolean' ? !en_pause : !havecontent || paused || !playing);
    this.btndownload.disabled = recording || !havecontent;

    let applyClass = (btn) => {
      if (btn.disabled) {
        btn.classList.add(MorsePlayer.SVG_INACTIF);
      } else {
        btn.classList.remove(MorsePlayer.SVG_INACTIF);
      }
    };
    applyClass(this.btnstop);
    applyClass(this.btnplay);
    applyClass(this.btnpause);
    applyClass(this.btndownload);
  }
  constructClearZone() {
    if (!this.options.clearZone) return;
    let trc = this.clearzone.rows[0];
    let trm = this.clearzone.rows[1];
    trc.innerHTML = trm.innerHTML = '';
    let title = 'set next playing symbol to this';
    this.cwplayer.TextArray.forEach((c,i) => {
      let caction = (e) => {
        if (this.czJustScrolled) {
          this.czJustScrolled = false;
          return;
        }
        this.cwplayer.Index = e.srcElement?.dataset?.index;
      };
      let cell = trc.insertCell();
      cell.title = title;
      cell.dataset.index = i;
      cell.addEventListener('touchend', caction);
      cell.addEventListener('click', caction);
      cell.innerHTML = c;
      cell = trm.insertCell();
      cell.title = title;
      cell.dataset.index = i;
      cell.addEventListener('touchend', caction);
      cell.addEventListener('click', caction);
      cell.innerHTML = CWPlayer.translate(c.length>1?`{${c}}`:c);
    });
  }
  updateClearZone() {
    if (!this.options.clearZone) return;
    [...this.shadowRoot.querySelectorAll('.currentchar')].forEach(e => e.classList.remove('currentchar'));
    let idx = this.cwplayer.Index;
    if (idx<0 || idx>=this.clearzone.rows[0].cells.length) {
      return;//idx = this.cwplayer.TextArray.length;
    }
    let cells = [this.clearzone.rows[0].cells[idx], this.clearzone.rows[1].cells[idx]];
    cells.forEach(c => c?.classList.add('currentchar'));
    cells[0]?.scrollIntoView();
    this.czwrapper.scrollLeft+=2;
  }
}

customElements.define(MorsePlayer.TAG, MorsePlayer);

class NoiseGainNode/* extends GainNode*/ {
  static get MAX_NOISE() { return 0.85; }
  static get NOISE_PROC() {
    return `
    const randomWhite = () => Math.random() * 2 - 1;
    class NoiseGen extends AudioWorkletProcessor {
      constructor() {
        super();
        this.lastOut = 0.0;
        this.currentQuantity=-1;
      }
      static get parameterDescriptors () {
        return [{
          name: 'quantity',
          defaultValue: 0.5,
          minValue: 0,
          maxValue: `+NoiseGainNode.MAX_NOISE+`,
          automationRate: "k-rate"
        },{
          name: 'volume',
          defaultValue: 1,
          minValue: 0,
          maxValue: 1,
          automationRate: "a-rate"
        }];
      }
      process([inputs], [outputs], parameters) {
        if (this.currentQuantity != parameters.quantity[0]) {
          this.port.postMessage(parameters.quantity[0]);
          this.currentQuantity = parameters.quantity[0];
        }
        let input = inputs[0];
        let output = outputs[0];
        if (parameters.quantity[0]) {
          // Noise
          for (let i = 0; i < output.length; ++i) {
            let white = Math.random() * 2 - 1;
            output[i] = (this.lastOut + (0.02 * white)) / 1.02;
            this.lastOut = output[i];
            output[i] *= 3.5; // (roughly) compensate for gain
          }
          // Drive
          let drive = 0.2*parameters.quantity[0]/`+NoiseGainNode.MAX_NOISE+`;
          let drv = Math.pow(0.05,drive);
          for (let i = 0; i < output.length; ++i) {
            let d=output[i];
            if(d<0)
              output[i]=-Math.pow(-d,drv);
            else
              output[i]=Math.pow(d,drv);
          }
          for (let c = 1; c < outputs.length; ++c) {
            outputs[c].set(outputs[0]);
          }
        }
        // Mix input
        if (inputs.length) {
          for (let c = 0; c < outputs.length; ++c) {
            for (let i = 0; i < outputs[c].length; ++i) {
              outputs[c][i] = parameters.quantity[0]*outputs[c][i] + parameters.volume[0]*(1-parameters.quantity[0])*inputs[c][i];
            }
          }
        }

        return true;
      }
    }
    registerProcessor("NoiseGen", NoiseGen);
    `;
  }
  constructor(context, options) {
    if (!context) throw new Error('NoiseGenerator : No AudioContext');
    this.context=context;
    const nativeConnect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function(dstNode, inputNum, outputNum){
      if (dstNode instanceof NoiseGainNode) {
        dstNode = dstNode.InputNode;
      }
      return nativeConnect.call(this, dstNode, inputNum, outputNum);
    };
  }
  get InputNode() { return this.noise; }
  get OutputNode() { return this.noise; }
  async initAudio() {
    await this.context.audioWorklet.addModule('data:text/javascript,'+encodeURI(NoiseGainNode.NOISE_PROC));
    this.noise = new AudioWorkletNode(this.context, 'NoiseGen');
    this.quantity = this.noise.parameters.get('quantity');
    this.volume = this.noise.parameters.get('volume');
    let p = this.noise.port;
    p.addEventListener('message', (e) => {
      clearTimeout(this.volto);
      this.volume.cancelAndHoldAtTime(this.context.currentTime);
      if (this.quantity.value) {
        this.volumeVar();
      } else {
        this.volume.value = 1;
      }
    });
    p.start();
  }
  volumeVar() {
    let vol = 1;
    let dly = 1;
    let prevvol = this.volume.value;
    this.volume.cancelAndHoldAtTime(this.context.currentTime);
    if (this.quantity.value) {
      vol = Math.min(1, (0.9-this.quantity.value)+Math.random());
      dly = 1+Math.random()*5*prevvol; // volume bas ==> délai court
    }
    this.volume.linearRampToValueAtTime(vol, this.context.currentTime+dly);
    this.volto = setTimeout(this.volumeVar.bind(this), dly*1000);
  }
  connect(dstNode, inputNum, outputNum) {
    return this.OutputNode.connect(dstNode, inputNum, outputNum);
  }
}

class QRMGenerator {
  constructor(quantity=5, maxvolume=0.5) {
    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/!+?.@"0123456789'+' '.repeat(10);
    this.players = [];
    this.active = false;
    this.setParams(quantity, maxvolume);
  }
  
  get Active() { return this.active; }
  get MaxVolume() { return this.maxvolume; }
  set MaxVolume(value) {
    let oldMaxVolume = this.maxvolume;
    this.maxvolume = Math.min(1, Math.max(0, value));
    this.adjustPlayers(this.quantity, this.maxvolume, oldMaxVolume);
  }

  setParams(quantity, maxvolume) {
    this.quantity = Math.max(0, quantity);
    this.maxvolume = Math.min(1, Math.max(0, maxvolume));
    this.adjustPlayers(this.quantity, this.maxvolume);
  }
  adjustPlayers(quantity, maxvolume, oldmaxvolume=this.maxvolume) {
    if (this.players.length < quantity) {
      let nbplayers = this.players.length;
      for (let i=0; i<quantity-nbplayers; i++) {
        let p = new CWPlayer({no_noise: true});
        this.players.push(p);
        if (this.active) {
          this.startPlayer(i);
        }
      }
    } else if (this.players.length > quantity) {
      let nbplayers = this.players.length;
      for (let i=nbplayers-1; i>=quantity; i--) {
        let p = this.players.pop();
        if (this.active) {
          p.stop();
        }
      }
      if (!this.players.length) {
        this.active = false;
      }
    }
    this.players.forEach(p => {
      let volume = 0;
      if (oldmaxvolume>maxvolume) {
        volume = Math.min(maxvolume, p.Volume);
      } else if (oldmaxvolume<maxvolume) {
        volume = CWPlayer.rand(oldmaxvolume, maxvolume);
      } else {
        volume = maxvolume*(Math.random()/2+0.5);
      }
      p.Volume = volume*0.85;
    });
  }
  randText(length) {
    let result = '';
    length = Math.trunc(length);
    while (length--) {
      let c = null;
      do {
        c = this.alphabet.charAt(Math.floor(Math.random() * this.alphabet.length));
      }
      while (c == ' ' && (!result.length || result[result.length-1] == ' '));
      result += c;
    }
    return result;
  }
  start() {
    if (this.players.length && this.active) return;
    this.active = !!this.players.length;
    this.players.forEach((p, i) => this.startPlayer(i));
  }
  stop() {
    this.active = false;
    this.players.forEach(p => p.stop());
  }
  async startPlayer(index) {
    if (!this.players[index]) return; // si l'index n'existe plus c'est qu'on a réduit la capacité
    let player = this.players[index];
    let text = this.randText(10+40*Math.random());
    await CWPlayer.delay(Math.random()*3);
    if (!this.active || !this.players[index]) return; // si l'index n'existe plus c'est qu'on a réduit la capacité
    player.EffWPM = player.WPM = 15+20*Math.random();
    player.Tone = 300+1700*Math.random();
    player.Volume = 0.85*this.MaxVolume*(Math.random()/2+0.5);
    await player.play(text);
    if (!this.active || !this.players[index]) return;
    setTimeout(this.startPlayer.bind(this, index), 0);
  }
}
