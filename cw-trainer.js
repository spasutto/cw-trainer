const SVG_INACTIF = 'svg_inactif';
const HASHSEP = '_';
const DIT_SYMBOL = '<svg viewBox="0 0 150 100" height="22px" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="50" r="50" /></svg>';
const DAH_SYMBOL = '<svg viewBox="0 0 260 100" height="22px" xmlns="http://www.w3.org/2000/svg"><rect x="25" width="210" height="100" rx="15" /></svg>';
const FREETEXT_URL = 'https://raw.githubusercontent.com/spasutto/cw-trainer/main/freetext/CharlesDickens-OliverTwist.txt';
const synth = window.speechSynthesis;
var cwchecking = false;
var maxlessons = -1;
var cw_options = {
  lesson : 1,
  grouplen : 5,
  groupsnb : 10,
  simple_mode : false,
  learn_mode : false,
  freelisten: false,
  weighlastletters: false,
  wpm : 25,
  eff : 17,
  ews : 0,
  tone : 800,
  volume : 1,
  keyqual: 1
};
const KOCHCARS = ['K', 'M', 'U', 'R', 'E', 'S', 'N', 'A', 'P', 'T', 'L', 'W', 'I', '.', 'J', 'Z', '=', 'F', 'O', 'Y', ',', 'V', 'G', '5', '/', 'Q', '9', '2', 'H', '3', '8', 'B', '?', '4', '7', 'C', '1', 'D', '6', '0', 'X'];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "/+=.,\"$'()[]-:;@_!?¶&";
//https://www.qsl.net/ae0q/prosign.htm  https://m0juw.co.uk/prosigns-in-morse-code/  https://www.radioqth.net/morsecode https://www.kent-engineers.com/prosigns.htm
// https://www.kb6nu.com/cw-geeks-no-nonsense-guide-to-having-fun-with-morse-code-prosigns/
const PROSIGNS = ['{AR}', '{AS}', '{BK}', '{BT}', '{CL}', '{CT}', '{KN}', '{SK}', '{SN}', '{VA}', '{VE}', '{EEEEEEEE}'];
var QSOs = [
  //http://lidscw.org/resources/cq-qso-template
  'CQ CQ CQ DE %IND1% %IND1% %IND1% PSE K',
  '%IND1% DE %IND2% %IND2% %IND2% {KN}',
  '%IND2% DE %IND1% = GA ES TNX FER CALL = UR RST %RST1% %RST1% = NAME IS %NAME1% %NAME1% QTH %QTH1% %QTH1% = HW? {AR} %IND2% DE %IND1% {KN}',
  '%IND1% DE %IND2% = GA %NAME1% TNX FB RPT UR RST %RST2% %RST2% = OP %NAME2% %NAME2% ES QTH %QTH2% %QTH2% = HW? {AR} %IND1% DE %IND2% {KN}',
  '%IND2% DE %IND1% = R TNX RPT ES INFO %NAME2% = RIG IS FTDX1200 PWR 100W ANT IS YAGI = WX IS SUNNY ES WARM 100F = HW? {AR} %IND2% DE %IND1% {KN}',
  '%IND1% DE %IND2% = RIG IS FT817 5W ES ANT IS DIPOLE = WX IS WET AND COLD {AR} %IND1% DE %IND2% {KN}',
  '%IND2% DE %IND1% = MNI TNX INFO ES FB QSO = PSE QSL VIA BURO = 73 ES CUAGN {AR} %IND2% DE %IND1% {SK}',
  '%IND1% DE %IND2% = FB %NAME1% TNX FER NICE QSO 73 ES BCNU {AR} %IND1% DE %IND2% {SK}',
  //https://morsecode.ninja/files/Sample-Rag-Chew-QSO-v10.pdf
  'CQ CQ de %IND1% %IND1% K',
  '%IND1% de %IND2% %IND2% K',
  '%IND2% DE %IND1% = GA ES TNX FER THE CALL = UR RST IS %RST1% %RST1% = NAME HR %NAME1% %NAME1% MY QTH IS %QTH1% %QTH1% = HW CPY? %IND2% DE %IND1% {KN}',
  '%IND1% DE %IND2% R GA %NAME1% TNX FB RPT = RST %RST2% %RST2% = OP HR %NAME2% %NAME2% ES QTH %QTH2% %QTH2% = HW? %IND1% DE %IND2% K',
  '{BK} NAME? NAME? {BK}',
  '{BK} %NAME2% %NAME2% HW? {BK}',
  '%IND2% DE %IND1% = R R R TNX FER THE RPT ES INFO %NAME2% = MY RIG HR IS KX3 RUNS 100W WID AMP ES ANT IS A 4 ELE YAGI UP 76 FT = WX IS WET AND CO0L 45F = HW NW? %IND2% DE %IND1% K',
  '%IND1% DE %IND2% SOLID COPY %NAME1% = RIG ELECRAFT K3S RUNS KW ANT IS LOOP AT 65 FT = WX SUNNY ES WARM 88F = AGE 70 HAM FOR 40 YEARS = SO HW? %IND1% DE %IND2% {KN}',
  '%IND2% DE %IND1% = FB COPY %NAME2% WID QSB = AGE HR IS 50 ES BN A HAM FER 6 YRS = RECENTLY RETIRED BUT NW BACK TO WORK AS CERTIFIED TOWER MONKEY = %IND2% DE %IND1% K',
  '%IND1% DE %IND2% FB %NAME1% = RECENTLY RETIRED NURSE ANESTHETIST = LIVING THE DREAM = HW? %IND1% DE %IND2% K',
  '%IND2% DE %IND1% FB %NAME2% = GUD CPY WID MORE QSB HR = TNX FER THE INFO ES QSO = PSE QSL VIA LOTW = 73 ES HPE 2 CU AGN {SK} %IND2% DE %IND1% K',
  '%IND1% DE %IND2% = FB %NAME1% WL QSL LOTW ES TNX QSO GD 73 {AR} {SK} %IND1% DE %IND2% E E',
  //http://naqcc.info/cw_qsos.html
  '%IND1% DE %IND2% GM TNX CALL UR %RST1% %RST1% IN %QTH1% %QTH1% NAME IS %NAME1% %NAME1% HW? {AR} %IND1% DE %IND2% K',
  '%IND2% DE %IND1% GM %NAME1% UR %RST2% %RST2% IN %QTH2% %QTH2% NAME IS %NAME2% %NAME2% HW? {AR} %IND2% DE %IND1% {KN}',
  '%IND1% DE %IND2% R FB %NAME2% NICE TO MEET YOU {BT} THE RIG HR IS A KNWD TS-570D AT QRP 5W TO AN ATTIC RANDOM WIRE {BT} THE WX LITE SNOW ES 33 DEGREES HW? {AR} %IND1% DE %IND2% {KN}',
  '%IND2% DE %IND1% R FB ON ALL %NAME1% {BT} THE XYL SAYS SUPPER IS READY SO I MUST GO {BT} TNX QSO HPE CUL 73 GE {SK} %IND2% DE %IND1% K',
  '%IND1% DE %IND2% OK %NAME2% WONT HOLD YOU TNX QSO HPE CUAGN VY 73 GE {SK} %IND1% DE %IND2% E E',
  //http://www.iv3ynb.altervista.org/samplecode.htm
  '%IND2% DE %IND1% GM DR OM ES TNX FER CALL UR RST RST RST IS %RST1% %RST1% FB MY QTH QTH IS %QTH1% %QTH1% MY NAME NAME IS %NAME1% %NAME1% HW ? %IND2% DE %IND1% {KN}',
  '%IND1% DE %IND2% R R GM DR %NAME1% ES TNX FER RST UR RST RST RST IS 599 599 5NN FB MY QTH QTH QTH IS %QTH2% %QTH2% %QTH2% MY NAME IS %NAME2% %NAME2% %NAME2% HW ? %IND1% DE %IND2% {KN}',
  '%IND2% DE %IND1% FB DR %NAME2% IN %QTH2% HR RTX IS TS50 TS50 PWR IS %PWR1%W %PWR1%W ANT IS VERT VERT WX WX IS CLOUDY CLOUDY TEMP 15C = NW QRU QRU TNX FER NICE QSO = PSE QSL MY QSL SURE VIA BURO 73 73 ES CUAGN CIAO %IND2% DE %IND1% {SK} {SK}  I',
  '%IND1% DE %IND2% R R OK DR %NAME1% FB HR RTX IS YAESU FT920 FT920 ANT IS DIPOLE DIPOLE WX WX FINE TEMP 30C TNX FER FB QSO QSL OK OK 73 73 GL GB %IND1% DE %IND2% {SK} {SK} I'
  ];
var keystates = {
  'playpause': false,
  'backtostart': false,
  'fwdtoend': false,
  'indexdec': false,
  'indexinc': false
};
function irand(start, end) {
  if (arguments.length < 2) {
    end = start;
    start = 0;
  }
  return Math.floor(Math.random()*(++end-start))+start;
}
function generateQTH(excepted=null) {
  const cities = ['NEW YORK', 'GRENOBLE', 'LAX', 'HAMBURG', 'BANGOR', 'ALGER', 'AMSTERDAM', 'BINGHAMTON',
  'BOTKYRKA', 'BUCHAREST', 'PALERMO', 'DRUMMONDVILLE', 'KRAKOW', 'LIMERICK', 'MANCHESTER', 'VILA VERDE', 'MELTON',
  'BARAKALDO', 'CARTAGENA', 'DRAMMEN', 'PARIS', 'BOMOMANI', 'MANIPAL', 'ALBANY', 'KITTANNING'];
  let qth = null;
  do {
    qth = cities[irand(cities.length-1)];
  }
  while (qth == excepted);
  return qth;
}
function generateRandomFirstname(excepted=null) {
  const fnames = ['STEVE', 'JANE', 'JOHN', 'ROY', 'MARTIN', 'SYLVAIN', 'PABLO', 'HENRY', 'FELIPE', 'LUCILLE', 'MARIA', 'JUAN', 'ROBERT', 'WILLIAM', 'CHARLEEN', 'PETE'];
  let fname = null;
  do {
    fname = fnames[irand(fnames.length-1)];
}
  while (fname == excepted);
  return fname;
}
function generateRandomCallsign(excepted=null) {
  let rdnchar = () => ALPHA.charAt(irand(ALPHA.length));
  let cs = null;
  do {
    cs = rdnchar()+(Math.random()>0.98 ?rdnchar():'')+irand(1, 9)+rdnchar()+rdnchar()+(Math.random()>0.2?rdnchar():'')+(Math.random()>0.95 ?'/'+(Math.random()>=0.5?'P':'M'):'');
  }
  while (cs == excepted);
  return cs;
}
function generateRandomRST() {
  let r = irand(4, 5);
  let s = irand(6, 9);
  let t = 9;
  if (s == 9 && Math.random()>0.6) s = t = 'N';
  else t = Math.random()>0.8 ? 8 : 9;
  if (s < 8) r = 4;
  return ''+r+s+t;
}
function generateRandomString(chars, len) {
  return Array.apply(null, Array(len)).map(() => {
    return chars[irand(chars.length-1)];
  }).join('');
}
function generateRandomText(chars, grouplen, groupsnb) {
  if (grouplen != -1) grouplen = Math.max(1, Math.min(8, grouplen));
  else grouplen = irand(1, 8);
  return Array.apply(null, Array(groupsnb)).map(() => generateRandomString(chars, grouplen)).join(' ');
}
async function getUrl(url, bypass_cache=false, binary=false) {
  let rep = null;
  try {
    rep = await fetch(url, {'cache': bypass_cache?'reload':'force-cache'});
    if (rep.status < 200 || rep.status >= 300) throw new Error();
    if (!binary) {
      rep = await rep.text();
    } else {
      rep = await rep.arrayBuffer();
    }
  } catch(e) {
    rep=null;
  }
  return rep;
}
async function generateFreeText(minlength = 60, maxlength = 150) {
  // on peut appeler plusieurs fois les URL, normalement elles sont cachées
  loading();
  let text = window.freetext ?? (await getUrl(FREETEXT_URL));
  loading(false);
  window.freetext = text;
  let startoftext = 'CHAPTER I';
  let startidx = text?.indexOf(startoftext);
  if (startidx>=0) {
    startidx += startoftext.length;
    text = text.substring(startidx).trim();
  }
  if (typeof text !== 'string' || text.length <= minlength) {
    alert('Unable to load free text (no internet connection ?)');
    window.freetext = null;
    return null;
  }
  text = text.replaceAll(/Mr(s)?\./g, 'Mr$1');
  let gentext = '';
  const uselength = text.lastIndexOf('.') - 1;
  let nbtry = 0;
  const regclean = /^\s*'\s*[^\w]/g;
  let startind = 0, prvptid = 0, nxtptid = 0, tmpnxtptid = 0;
  do {
    startind = irand(uselength);
    prvptid = text.lastIndexOf('.', startind);
    if (prvptid == -1 || text.length-prvptid<=minlength) continue;
    do {
      nxtptid = text.indexOf('.', startind);
      tmpnxtptid = text.indexOf('?', startind);
      if (tmpnxtptid > -1 && tmpnxtptid<nxtptid) nxtptid = tmpnxtptid;
      tmpnxtptid = text.indexOf('!', startind);
      if (tmpnxtptid > -1 && tmpnxtptid<nxtptid) nxtptid = tmpnxtptid;
      if (nxtptid == -1) nxtptid = text.length;
      else if (nxtptid-prvptid < minlength) {
        startind = nxtptid + 1;
      }
    } while (nxtptid-prvptid < minlength);
    //console.log('--------------------------------------------------------------------------------------------');
    //console.log(text.substring(prvptid+1, nxtptid+1));
    gentext = text.substring(prvptid+1, nxtptid+1)
        .replaceAll(/\r?\n/g, ' ')
        .replaceAll(/\s+/g, ' ')
        .replaceAll(/^["']+\s*(["'])*/g, '$1').trim();
    if (text[nxtptid+1] == '"') gentext += '"';
    while (regclean.test(gentext)) {
      gentext = gentext.replaceAll(regclean, '\'');
    }
    //console.log(gentext);
  } while ((gentext.length<minlength || gentext.length>maxlength) && ++nbtry<80);
  return gentext;
}
async function generateText() {
  if (!cwplayer || cw_options.learn_mode) return;
  let cwgentext = '';
  if (!cw_options.freelisten) {
    cwplayer.Text = '';
    if (cw_options.simple_mode) {
      let letters = null;
      if (cw_options.lesson == 41) {
        letters = ALPHA.split('');
      } else if (cw_options.lesson == 42) {
        letters = NUMBERS.split('');
      } else if (cw_options.lesson == 43) {
        letters = SYMBOLS.split('');
      } else {
        let maxlesson = Math.min(40, cw_options.lesson);
        letters = KOCHCARS.slice(0, maxlesson+1);
        if (cw_options.weighlastletters) {
          // lettres "nouvelles"
          let newletters = KOCHCARS.slice(Math.max(0, maxlesson-2), maxlesson+1);
          // plus de poids pour les lettres nouvelles :
          // 1/4 des lettres doivent être les 'récentes'
          let nbtl = Math.floor(letters.length+letters.length/3);
          while (letters.length < nbtl) letters.push(...newletters);
        }
      }
      cwgentext = generateRandomString(letters, 1);
    } else if (cw_options.lesson==44) {
      cwgentext = generateRandomText(PROSIGNS, 1, cw_options.groupsnb);
    } else if (cw_options.lesson==45) {
      let callsign1 = generateRandomCallsign();
      let callsign2 = generateRandomCallsign(callsign1);
      let name1 = generateRandomFirstname();
      let name2 = generateRandomFirstname(name1);
      let qth1 = generateQTH();
      let qth2 = generateQTH(qth1);
      cwgentext = QSOs[irand(QSOs.length-1)]
          .replaceAll('%IND1%', callsign1)
          .replaceAll('%IND2%', callsign2)
          .replaceAll('%NAME1%', name1)
          .replaceAll('%NAME2%', name2)
          .replaceAll('%RST1%', generateRandomRST())
          .replaceAll('%RST2%', generateRandomRST())
          .replaceAll('%PWR1%', ''+irand(1, 10)*10)
          .replaceAll('%PWR2%', ''+irand(1, 10)*10);
    } else if (cw_options.lesson==46) {
      cwgentext = await generateFreeText();
    } else {
      let letters = null;
      if (cw_options.lesson == 41) {
        letters = ALPHA.split('');
      } else if (cw_options.lesson == 42) {
        letters = NUMBERS.split('');
      } else if (cw_options.lesson == 43) {
        letters = SYMBOLS.split('');
      }  else {
        let maxlesson = Math.min(40, cw_options.lesson);
        letters = KOCHCARS.slice(0, maxlesson+1);
        if (cw_options.weighlastletters) {
          // lettres "nouvelles"
          let newletters = KOCHCARS.slice(Math.max(0, maxlesson-2), maxlesson+1);
          // plus de poids pour les lettres nouvelles :
          // 1/4 des lettres doivent être les 'récentes'
          let nbtl = Math.floor(letters.length+letters.length/3);
          while (letters.length < nbtl) letters.push(...newletters);
        }
      }
      cwgentext = generateRandomText(letters, cw_options.grouplen, cw_options.groupsnb);
    }
    cwplayer.Text = cwgentext;
    return cwgentext;
  } else {
    cwplayer.Text = cw_options.simple_mode ? iptfree.value : cw_options.learn_mode ? iptlearn.Value : cwtext.value;
  }
}
function compareStrings(str1, str2, ignorecase=true){
  str1 = str1.replaceAll('\r', '').replaceAll(/\n+/g, ' ');
  str2 = str2.replaceAll('\r', '').replaceAll(/\n+/g, ' ');
  if (ignorecase) {
    str1 = str1.toUpperCase();
    str2 = str2.toUpperCase();
  }
/*
 Ce qui suit est un algorithme de recherche des sous-chaines communes.
 On filtre ensuite les résultats pour les besoins du moment
 Source : 
https://stackoverflow.com/questions/28321273/how-to-find-the-most-common-part-of-a-string
https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Longest_common_substring#JavaScript
https://stackoverflow.com/a/34807141
*/
  let sequences = {};
  if (str1 && str2) {
    let str1Length = str1.length,
      str2Length = str2.length,
      num = new Array(str1Length),
      idx = null;
  
    for (let i = 0; i < str1Length; i++) {
      let subArray = new Array(str2Length);
      for (let j = 0; j < str2Length; j++)
        subArray[j] = 0;
      num[i] = subArray;
    }
    for (let i = 0; i < str1Length; i++)
    {
      for (let j = 0; j < str2Length; j++)
      {
        if (str1[i] !== str2[j])
          num[i][j] = 0;
        else
        {
          if ((i === 0) || (j === 0))
            num[i][j] = 1;
          else
            num[i][j] = 1 + num[i - 1][j - 1];
   
          idx = (i - num[i][j] + 1)+","+(j - num[i][j] + 1);
          if (typeof sequences[idx] !== 'string') sequences[idx] = '';
          sequences[idx] += str1[i];
        }
      }
    }
  }
  sequences = Object.keys(sequences).map(k => {
    let idxs = k.split(',');
    return {'isrc' : parseInt(idxs[0], 10), 'idst' : parseInt(idxs[1], 10), 'text' : sequences[k]};
  });

  /******************************
  // FILTRAGE DES RESULTATS
   *****************************/
  // suppression des chaines communes contenues dans des chaines plus grandes
  sequences = sequences.filter(s =>
    !sequences.some(s2 => s2.text.length > s.text.length && ((s2.isrc <= s.isrc && s2.isrc+s2.text.length>s.isrc) || (s2.idst <= s.idst && s2.idst+s2.text.length>s.idst)))
  );
  let j = -1;
  for (let i=0; i<sequences.length;i++) {
    let s = sequences[i];
    // suppression des chaines dans le désordre ex: '/UQ/T', '/QT'
    while ((j = sequences.findIndex((s2, i2) => i2 > i && (s2.idst <= s.idst || s2.isrc <= s.isrc))) > -1) {
      sequences.splice(j, 1);
    }
    // suppression des chaines qui chevauchent d'autres chaines ex 'IVNVV', 'IVVV'
    while ((j = sequences.findIndex((s2, i2) => i2 > i && (s.idst+s.text.length>s2.idst || s.isrc+s.text.length>s2.isrc))) > -1) {
      sequences.splice(j, 1);
    }
  }
  return {'str1':str1, 'str2':str2, 'errors':str1.length-sequences.reduce((acc, cur) => acc+=cur.text.length, 0), 'sequences': sequences};
}
const emptyChar = '&nbsp;';//'_';
function formatTestString(ret) {
  let sret = '';
  let sequences = ret.sequences, str1=ret.str1, str2=ret.str2;
  if (!str1.length && !str2.length) return sret;
  if (!sequences.length && str2.length) {
    // affichage de toute la chaine de test (fausse)
    sret += `<span class="wrong">${str2}</span>`;
    if (str2.length <= str1.length) {
      sret += `<span class="empty">${emptyChar.repeat(str1.length-str2.length)}</span>`;
    }
  } else if (!sequences.length && str1.length && !str2.length) {
    // affichage du bon nombre de caractères vide
    sret += `<span class="empty">${emptyChar.repeat(str1.length)}</span>`;
  } else {
    let i1 = 0, i2 = 0;
    sequences.forEach(seq => {
      // il va falloir compléter avant la séquence
      if (seq.isrc>i1 || seq.idst>i2) {
        if (seq.isrc-i1 > seq.idst-i2) {
          // cas 1
          let lenempty = (seq.isrc-i1)-(seq.idst-i2);
          let lenwrong = (seq.isrc-i1)-lenempty;
          if (lenwrong > 0) sret += `<span class="wrong">${str2.substring(i2, i2+lenwrong)}</span>`;
          if (lenempty > 0) sret += `<span class="empty">${emptyChar.repeat(lenempty)}</span>`;
        } else if (seq.isrc-i1 < seq.idst-i2) {
          // cas 2 ==> tous les caractères sont faux
          let lenwrong = (seq.idst-i2)-(seq.isrc-i1);
          if (lenwrong > 0) sret += `<span class="wrong">${str2.substring(i2, i2+lenwrong)}</span>`;
        } else {
          // cas 3 ==> il y'a n caractères faux entre les deux séquences
          let lenwrong = seq.idst-i2;
          if (lenwrong > 0) sret += `<span class="wrong">${str2.substring(i2, i2+lenwrong)}</span>`;
        }
      }
      sret += `<span class="right">${seq.text}</span>`;
      i1 = seq.isrc + seq.text.length;
      i2 = seq.idst + seq.text.length;
    });
    // il reste du texte en fin de str1 ou str 2 
    if (i1 < str1.length || i2 < str2.length) {
      let lenwrong = str2.length-(i2);
      let lenempty = str1.length-(i1)-lenwrong;
      if (lenwrong > 0) sret += `<span class="wrong">${str2.substring(i2, i2+lenwrong)}</span>`;
      if (lenempty > 0) sret += `<span class="empty">${emptyChar.repeat(lenempty)}</span>`;
    }
  }
  return sret;
}
function key(value) {
  if (overlayloading.style.display==='flex') return;
  if (cw_options.simple_mode) {
    iptfree.value=value;
    iptfree.focus();
    verifycw();
  } else if (cw_options.learn_mode) {
    iptlearn.value=value;
    iptlearn.focus();
    verifycw();
  } else {
    cwtext.value+=value;
    cwtext.focus();
  }
}
var fact = [];
function factorial(n) {
  if (n == 0 || n == 1)
    return 1;
  if (fact[n] > 0)
    return fact[n];
  return fact[n] = factorial(n-1) * n;
}
function combinaisons(array, length, action) {
  return array.flatMap((v, i) => {
    if (new Date().getTime() > window.intperm) return [];
    let ret = length > 1
    ? combinaisons(array.slice(i + 1), length - 1, action).map(w => [v, ...w])
    : [[v]];
    action(ret);
    return ret;
  });
}
function trypopulatevoices() {
  if (window.anyvoice) return;
  window.voices = [];
  try {
    window.voices = synth?.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase();
      const bname = b.name.toUpperCase();
  
      if (aname < bname) {
        return -1;
      } else if (aname == bname) {
        return 0;
      } else {
        return +1;
      }
    });
    window.anyvoice = Array.isArray(window.voices) && window.voices.length > 0;
    if (!anyvoice) {
      return;
    }
    window.voices.unshift({'name':' - none - ', 'lang':'deactivated'});
    voices.forEach(v => {
      let option = document.createElement("option");
      option.textContent = `${v.name} (${v.lang})`;
      selvoices.appendChild(option);
    });
    selvoices.addEventListener('change', (e) => {
      if (selvoices?.selectedIndex > -1 && Array.isArray(window.voices) && voices.length > selvoices.selectedIndex) {
        window.speechvoice = voices[selvoices.selectedIndex];
      }
    });
    let getLangStrict = (l) => l.trim().toLowerCase().replaceAll(/[^a-z]*/g, '');
    let getLang = (l) => l.trim().toLowerCase().match(/^[a-z]*/g)[0];
    let navlang = getLangStrict(navigator.language);
    let voiceindex = window.voices.findIndex(v => navlang == getLangStrict(v.lang));
    if (voiceindex < 0) {
      navlang = getLang(navigator.language);
      voiceindex = window.voices.findIndex(v => navlang == getLang(v.lang));
    }
    if (voiceindex > -1) {
      selvoices.selectedIndex = voiceindex;
      window.speechvoice = voices[voiceindex];
    }
    speechvoices.style.display = cw_options.learn_mode?'block':'none';
  } catch(e) {console.error(e);}
}
async function tryspeak(letter) {
  return new Promise(res => {
    try {
      if (typeof synth?.speaking !== 'boolean' || window.speechvoice?.lang == 'deactivated') {
        res();
        return;
      }
      if (synth.speaking) {
        synth.cancel();
      }
      window.synthutter = new SpeechSynthesisUtterance(letter);
      synthutter.onend = () => { window.synthutter = null; res(); };
      synthutter.onerror = () => { window.synthutter = null; res(); };
      if (window.speechvoice) {
        synthutter.voice = window.speechvoice;
        synthutter.lang = window.speechvoice.lang
      }
      synth.speak(synthutter);
    } catch(e) {
      console.error(e);
      res();
    }
  });
}
function compareProsigns(ps1, ps2) {
  let cleanText = t => (t??'').replaceAll(/[^A-Z]/g, '');
  ps1 = cleanText(ps1);
  ps2 = cleanText(ps2);
  let valid = CWPlayer.translate(`{${ps1}}`)==CWPlayer.translate(`{${ps2}}`);
  return {
    'str1':ps1,
    'str2':ps2,
    'errors':valid?0:1,
    'sequences':valid?[{'isrc':0,'idst':0,'text':ps2}]:[]
  }
}
async function verifycw(e) {
  if (!cwplayer || cwchecking) return;
  cwchecking = true;
  if (cw_options.learn_mode) {
    if (e?.keyCode == 16 || (e?.key.length>1 && e?.key != 'Unidentified')) { // shift et autres touches non imprimables
      cwchecking = false;
      return;
    }
    let cwcar = CWPlayer.cleanText(iptlearn.value);
    iptlearn.classList.add('blue', 'nocarret');
    iptlearnmorse.innerHTML = '';
    await cwplayer.stop();
    await cwplayer.play(cwcar);
    await Promise.race([tryspeak(cwcar), CWPlayer.delay(2)]);
    cwchecking = false;
    let tr = CWPlayer.translate(cwcar).split('').filter(s => ['.','-'].includes(s)).map(s => s == '.' ? DIT_SYMBOL : DAH_SYMBOL).join('');;
    iptlearnmorse.innerHTML = `<a href="#" onclick="verifycw();return false;" title="replay">${tr}</a>`;
    await CWPlayer.delay(1);
    iptlearn.classList.remove('blue', 'nocarret');
  } else if (cw_options.simple_mode) {
    if (e?.keyCode == 16 || (e?.key.length>1 && e?.key != 'Unidentified')) { // shift et autres touches non imprimables
      cwchecking = false;
      return;
    }
    let cwcar = iptfree.value;
    iptfree.value = '';
    iptfree.classList.add('nocarret');
    if (cw_options.freelisten || cwcar==' ') {
      cwplayer.stop();
      iptfree.classList.add('blue');
      iptfree.value = '\u266A';
      cwplayer.play(cw_options.freelisten?cwcar:null).then(() => {
        iptfree.classList.remove('blue');
        iptfree.classList.remove('nocarret');
        iptfree.value = '';
        iptfree.focus();
        cwchecking = false;
      });
      return;
    }
    if (cwcar.toUpperCase() != cwplayer.Text[0]) {
      iptfree.classList.add('error');
      iptfree.value = '\u274C';//'ERROR';
      CWPlayer.delay(0.35).then(() => {
        iptfree.classList.remove('error');
        iptfree.classList.remove('nocarret');
        cwchecking = false;
      });
      cwplayer.stop();
      await cwplayer.playBoop();
      if (window.freefirsttry) {
        window.freefirsttry = false;
        window.freeerr++;
      }
      iptfree.value = '';
    } else {
      iptfree.classList.add('ok');
      iptfree.value = '\u2714';//'GOOD !';
      CWPlayer.delay(0.35).then(() => {
        iptfree.classList.remove('ok');
        iptfree.classList.remove('nocarret');
        iptfree.value = '';
        cwchecking = false;
      });
      generateText();
      cwplayer.play();
      window.freetotal++;
      window.freefirsttry = true;
    }
    
    zoneresultfree.innerHTML = `Success rate : ${Math.round((100*(freetotal-freeerr)/freetotal)*10)/10}% (${window.freetotal-1} symbols)`;

    iptfree.focus();
  } else {
    if (cw_options.freelisten) {
      cwchecking = false;
      return;
    }
    if (cwplayer.Playing) cwplayer.stop();
    cwsbm.disabled = true;
    let comparefn = cw_options.lesson == 44 ? compareProsigns : compareStrings;
    let cleanText = (t) => CWPlayer.cleanText(t.trim()).replaceAll('\t', ' ').replaceAll(/[{}]/g, '');
    let extractfn = (t) => [cleanText(t)];
    // hormis pour les QSOs et le texte libre on travaille par mot => on recompare mot par mot
    if (cw_options.lesson <= 44) {
      extractfn = (t) => cleanText(t).split(' ').filter(e => e.length > 0);
    }
    let inpt = extractfn(cwtext.value);
    let verif = extractfn(cwplayer.Text);
    let results = verif.map((a, i) => comparefn(a, inpt[i] ?? ''));
    let nbchars = verif.reduce((acc, cur) => acc+cur.length, 0);
    let nberr = results.reduce((acc, cur) => acc+cur.errors, 0);
    let maxerrs = nberr;
    if (inpt.length < verif.length) {
      // on cherche si par hasard il n'y aurait pas eu un oubli d'espace
      let toobigwords = cw_options.grouplen < 0 ? [] : inpt.filter(ipt => ipt.length > cw_options.grouplen && ipt.length%cw_options.grouplen == 0);
      if (cw_options.grouplen > 0 && toobigwords.length > 0) {
        let newinpts = [];
        for (let i=0; i<inpt.length; i++) {
          if (inpt[i].length>cw_options.grouplen && inpt[i].length%cw_options.grouplen==0) {
            newinpts.push(...inpt[i].match(new RegExp(`.{1,${cw_options.grouplen}}`, 'g')));
          } else {
            newinpts.push(inpt[i]);
          }
        }
        inpt = newinpts;
        results = verif.map((a, i) => comparefn(a, inpt[i] ?? ''));
        nberr = results.reduce((acc, cur) => acc+cur.errors, 0);
      }
    }
    if (inpt.length < verif.length) {
      if (confirm('Warning : it seems that you have not entered enough groups, are you sure to proceed to verification?')) {
        let nbtofill = verif.length-inpt.length;
        // on tente de trouver l'emplacement du/des mot(s) qui manque(nt)
        inpt.push(...Array(nbtofill).fill('')); // on insère pour permettre aux insertions de combinaisons de fonctionner sans soucis
        // on va faire toutes les combinaisons possible pour insérer les 'nbtofill' mots manquants
        // pour chaque combinaison on va calculer le nombre d'erreur et on prendra la combinaison avec le plus faible taux d'erreur
        if (inpt.reduce((a,c)=>a+=c.length,0)>0 && factorial(verif.length)<Number.MAX_VALUE) {
          let temperr = Number.MAX_VALUE;
          let minerrindice = null;//Array(nbtofill).fill(0).map((_,i) => inpt.length-(nbtofill-i)); // valeur par défaut au cas où le traitement est interrompu
          let inpttmp = null;
          loading();
          await CWPlayer.delay(0.05);//sinon l'overlay de chargement ne s'affiche pas
          window.intperm = new Date().getTime() + 5000; // 5s max de traitement
          combinaisons(Array(verif.length).fill(0).map((_,i) => i), nbtofill, perms => perms.forEach(perm => {
            if (perm.length != nbtofill || new Date().getTime() > window.intperm) return;
            inpttmp = inpt.slice();
            for (let y=0; y<nbtofill; y++) {
              inpttmp.splice(perm[y], 0, '');
            }
            results = verif.map((a, i) => comparefn(a, inpttmp[i] ?? ''));
            nberr = results.reduce((acc, cur) => acc+cur.errors, 0);
            if (nberr < temperr) {
              temperr = nberr;
              minerrindice = perm.slice();
            }
            //inpttmp.splice(-1*nbtofill);
            //console.log(perm, inpttmp, nberr);
          }));
          loading(false);
          if (minerrindice == null || new Date().getTime() > window.intperm) {
            // emplacements d'origine (en fin de chaîne)
            minerrindice = Array(nbtofill).fill(0).map((_,i) => inpt.length-(nbtofill-i));
          }
          // on a trouvé l'emplacement, on insère et on compare définitivement
          for (let y=0; y<nbtofill; y++) {
            inpt.splice(minerrindice[y], 0, '');
          }
          results = verif.map((a, i) => comparefn(a, inpt[i] ?? ''));
          nberr = results.reduce((acc, cur) => acc+cur.errors, 0);
        }
      } else {
        cwsbm.disabled = false;
        cwchecking = false;
        return;
      }
    }
    results.forEach(r => {
      let str2bk = r.str2;
      // hormis pour les QSOs on travaille par mot
      if (cw_options.lesson <= 43) {
        r.str1 = r.str1.replaceAll(/\s/g, '\n');
        r.str2 = r.str2.replaceAll(/\s/g, '\n');
        r.str2 = formatTestString(r).replaceAll(/\s/g, '<BR>').replaceAll('<span<BR>class="', '<span class="');
        r.str1 = r.str1.replaceAll(/\s+/g, '<BR>');
      } else {
        r.str2 = formatTestString(r);
      }
      r.str2bk = str2bk;
    });
    // bug : cwplayer.Text='T5TWR DE N8LRT R FB ROBERT NICE TO MEET YOU BT THE RIG HR IS A KNWD TS-570D AT QRP 5W TO AN ATTIC RANDOM WIRE BT THE WX LITE SNOW ES 33 DEGREES HW? AR T5TWR DE N8LRT KN', cwtext.value='T5TWR DE N8LRT R FB ROBERT NICE TO MEET YOU BT THE RIG HR IS A KNWD TS-570D AT QRP 5W TO AN ATTIC RANDOM WIRE BT THE WX LITE SNOW ES 33 DEGREES HW? AR T5TWR N8LRT KN'
    let perc = (nbchars-nberr)*100/nbchars;
    perc = Math.round(perc*10)/10;
    let stats = [`${nbchars-nberr}/${nbchars} characters sent`];
    let missing = results.reduce((a,c) => a+=(c.str2.match(new RegExp(emptyChar, 'g')) || []).length, 0);
    if (missing > 0) stats.push(`${missing} missing${missing>1?'s':''}`);
    if (nberr > missing) stats.push(`${nberr-missing} error${nberr-missing>1?'s':''}`);
    zonerestext.innerHTML = `<h5>${perc}% success rate</h5><small>(${stats.join(', ')})</small><BR>`;
    let restable = '<table><th>original</th><th>input</th><th>errors</th>'
    results.forEach(r => {
      restable += `<tr><td><span><a href="#" title="listen" name="listen" onclick="listen('${r.str1.replaceAll('<BR>', ' ').replaceAll('\'', '\\\'').replaceAll('"', '&quot;')}', this);">${r.str1}</a></span></td>`;
      restable += `<td><a href="#" title="listen" name="listen" onclick="listen('${r.str2bk.replaceAll('\'', '\\\'').replaceAll('"', '&quot;')}', this);">${r.str2}</a></td>`;
      restable += `<td>${r.errors}</td></tr>`;
    });
    restable += '</table>';
    zonerestext.innerHTML += restable;
  
    retrynxt.style.display = cw_options.lesson <= 40 && perc>=90?'inline-block':'none';
    zoneresult.style.display = 'inline-block';
    keyboard.style.display = 'none';
    cwsbm.disabled = false;
    cwchecking = false;
  }
}
async function listen(text, elem) {
  if (cwplayer.Playing) {
    cwplayer.stop();
  }
  [...document.querySelectorAll('a[name="listen"]')].forEach(e => e.classList.remove('active'));
  if (elem) elem.classList.add('active');
  cwsbm.disabled = true;
  cwplayer.PreDelay=0.05;
  // Prosigns
  if (cw_options.lesson == 44) text = `{${text}}`;
  cwplayer.play(text);
}
async function selfDownload() {
  loading();
  let dlpromises = [getUrl(window.location.href, true)];
  if (confirm('Include Oliver Twist (required for offline free text mode)?\nThis will add ~1MB to the final page.')) {
    dlpromises.push(getUrl(FREETEXT_URL, true));
  }
  let [page, ot] = await Promise.all(dlpromises).catch(err => {console.error(err);});
  if (!page) {
    message('no connection !', 'error');
    loading(false);
    return;
  }
  const regscript = /<script\s+src\s*=\s*"([^"]+)"\s*>\s*<\/script>/gi;
  let occ = [...page.matchAll(regscript)];
  let script = '';
  for (let i=0; i<occ.length; i++) {
    let s = await getUrl(occ[i][1], true);
    if (!s) continue;
    script += s + '\n';
    if (i>0) {
      page = page.replace(occ[i][0], '');
    }
  }
  if (ot) {
    script += 'var freetext = `'+ot.replaceAll('`', '\\`')+'`;\n';
  }
  if (script) {
    page = page.replace(occ[0][0], '\u003cscript\u003e\n'+script.replaceAll('$', '$$$$')+'\u003c/script\u003e');
  }
  const regstyle = /<link\s+[^>]*href\s*=\s*"([^"]+)"[^>]*>/gi;
  occ = [...page.matchAll(regstyle)];
  for (let i=0; i<occ.length; i++) {
    let icon = occ[i][0].indexOf('icon') > -1;
    let data = await getUrl(occ[i][1], true, icon) ?? '';
    if (icon) {
      let bdata = '';
      let bytes = new Uint8Array(data);
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        bdata += String.fromCharCode( bytes[ i ] );
      }
      data = `\u003clink rel="icon" type="image/x-icon" href="data:image/x-icon;base64, ${window.btoa(bdata)}">`;
    } else if (data.trim().length > 0) {
      data = '\u003cstyle\u003e\n'+data.replaceAll('$', '$$$$')+'\u003c/style\u003e';
    }
    page = page.replace(occ[i][0], data)
  }
  let url = window.URL.createObjectURL(new Blob([page], {type: 'text/plain'}));
  let a = document.createElement('a');
  a.href = url;
  a.download = "cw_trainer.html";
  document.body.appendChild(a);
  a.click();    
  a.remove();
  loading(false);
}
function generateKeyboard() {
  keyboard.innerHTML = '';
  let keybhtml = '';
  Object.keys(CWPlayer.morse).forEach(c => {
    if ((c>='A'&&c<='Z') || c==' ') return;
    else if (c == '"') c = '\\"';
    keybhtml += `<input type="button" value="${c}">`;
    if (c == '9') keybhtml += '<BR>';
  });
  keyboard.innerHTML = keybhtml;
  [...document.querySelectorAll('#keyboard input')].forEach(i => i.onclick=key.bind(i, i.value));
}
function setMinMax() {
  selwpm.min = CWPlayer.MIN_WPM;
  selwpm.max = CWPlayer.MAX_WPM;
  seleffwpm.min = CWPlayer.MIN_WPM;
  seleffwpm.max = CWPlayer.MAX_WPM;
  selews.min = CWPlayer.MIN_EWS;
  selews.max = CWPlayer.MAX_EWS;
}
function decodeParam(val, i) {
  val = parseFloat(val);
  if (isNaN(val)) return;
  switch (i) {
    case 0:
      cw_options.lesson = Math.max(1, Math.min(maxlessons, Math.trunc(val)));
      break;
    case 1:
      cw_options.wpm = Math.max(CWPlayer.MIN_WPM, Math.min(CWPlayer.MAX_WPM, Math.trunc(val)));
      break;
    case 2:
      cw_options.eff = Math.max(CWPlayer.MIN_WPM, Math.min(CWPlayer.MAX_WPM, Math.trunc(val)));
      break;
    case 3:
      cw_options.grouplen = Math.max(-1, Math.min(8, Math.trunc(val)));
      if (cw_options.grouplen == 0) cw_options.grouplen = 1;
      break;
    case 4:
      cw_options.groupsnb = Math.max(1, Math.min(250, Math.trunc(val)));
      break;
    case 5:
      cw_options.tone = Math.max(CWPlayer.MIN_TONE, Math.min(CWPlayer.MAX_TONE, Math.trunc(val)));
      break;
    case 6:
      cw_options.ews = Math.max(CWPlayer.MIN_EWS, Math.min(CWPlayer.MAX_EWS, val));
      break;
    case 7:
      cw_options.simple_mode = val === 1;
      break;
    case 8:
      cw_options.freelisten = val === 1;
      break;
    case 9:
      cw_options.weighlastletters = val === 1;
      break;
    case 10:
      cw_options.keyqual = Math.max(CWPlayer.MIN_KEYQUAL, Math.min(CWPlayer.MAX_KEYQUAL, val));
      break;
    case 11:
      cw_options.volume = Math.max(0, Math.min(1, val));
      break;
    case 12:
      cw_options.learn_mode = val === 1;
      break;
  }
}
function round2(val) {
  return Math.round(100*val)/100;
}
function deferredSaveParam() {
  // permet d'éviter de freezer quand on bouge le curseur de volume. https://issues.chromium.org/issues/40113103
  window.clearTimeout(window.timeoutSaveParams);
  window.timeoutSaveParams = window.setTimeout(saveParams, 250);
}
function saveParams() {
  let params = encodeURIComponent(sellesson.value+HASHSEP+selwpm.value+HASHSEP+seleffwpm.value+HASHSEP+grplen.value+HASHSEP+groupsnb.value+HASHSEP+cw_options.tone+HASHSEP+round2(selews.value)+HASHSEP+(cw_options.simple_mode?1:0)+HASHSEP+(cw_options.freelisten?1:0)+HASHSEP+(cw_options.weighlastletters?1:0)+HASHSEP+round2(cw_options.keyqual)+HASHSEP+round2(cw_options.volume)+HASHSEP+(cw_options.learn_mode?1:0));
  try {
    window.name = params;
    localStorage.setItem("params", params);
  } catch(e) {}
  window.location.hash = params;
}
function loadParams() {
  //'30_25_15_5_15_800_0.6_0_0_1_1_0.41'
  const regparams = /\d{1,2}_\d{1,2}_\d{1,2}_-?\d_\d{1,3}_\d{1,4}_\d?\d.?\d*_(0|1)_(0|1)_(0|1)_\d.?\d*_\d.?\d*_(0|1)/i;
  let fromhash = false;
  let extractParams = (p) => regparams.test(p)?p.split(HASHSEP):[];
  let params = window.location.hash.substring(1);
  if (typeof params === 'string' && params?.trim().length > 0) {
    fromhash = true;
    extractParams(decodeURIComponent(params)).forEach(decodeParam);
  }
  try {
    if (typeof window.localStorage === 'object' && typeof localStorage.getItem === 'function') {
      params = localStorage.getItem("params");
    }
  } catch(e) {}
  params = params ?? window.name;
  if (typeof params === 'string' && params?.trim().length > 0) {
    // les parametres du hash sont prioritaires sur ceux du localstorage (excepté le volume)
    if (!fromhash) {
      extractParams(params).forEach(decodeParam);
    } else {
      // si dispo en localStorage, le volume est prioritaire sur sa valeur trouvée dans l'URL
      let volume = extractParams(params)[11];
      if (volume) {
        decodeParam(volume, 11);
      }
    }
  }
}
function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}
function showKeyboard(evt) {
  if (disablekb.checked || zoneresult.style.display=='block') return;
  keyboard.style.display = 'block';
}
function hideKeyboard(evt) {
  // on ne ferme pas le clavier dans ce cas
  if (evt && (keyboard.contains(evt.relatedTarget) || evt.relatedTarget?.type=='button')) return;
  keyboard.style.display = 'none';
}
function loading(load=true) {
  window.isLoading = !!load;
  if (typeof load === 'string') loadingzone.innerHTML= load;
  overlayloading.style.display = load?'flex':'none';
  loadingzone.style.display = load?'block':'none';
}
function message(msg='', style=null) {
  msg = typeof msg !== 'string' ? '' : msg;
  if (msg.trim().length <= 0) return;
  toaster.style.visibility = 'visible';
  toaster.removeAttribute('class');
  // https://stackoverflow.com/a/16619298/1346098
  window.setTimeout(() => {
    toaster.innerHTML = msg;
    toaster.classList.add('slidein');
    if (style) {
      toaster.classList.add(style);
    }
  }, 1);
}
window.addEventListener("load", async () => {
  // https://stackoverflow.com/a/25325330
  [...document.querySelectorAll('*[id]')].forEach(e => {
    window[e.id] = e;
  });
  window.modelinks = [...document.querySelectorAll("a[name='modes']")];
  setMinMax();
  window.maxlessons = Math.max.apply(null, [...document.querySelectorAll('#sellesson>option')].map(o => parseInt(o.value, 10)));
  loadParams();
  sellesson.value = cw_options.lesson;
  selwpm.value = cw_options.wpm;
  seleffwpm.value = cw_options.eff;
  grplen.value = cw_options.grouplen;
  groupsnb.value = cw_options.groupsnb;
  selews.value = cw_options.ews;
  cwplayer.addEventListener('play', () => {
    // on ne focus le texte que si on vient de démarrer la lecture, qu'on est en mode normal et qu'on est pas en train d'écouter un résultat
    if (!cw_options.simple_mode && !cw_options.learn_mode && !cw_options.freelisten && !document.querySelectorAll('a[name="listen"].active').length && cwplayer.CurrentTime < 0.5) {
      cwtext.focus();
    }
  });
  cwplayer.addEventListener('parameterchanged', (arg) => {
    if (arg == 'AutoPlay') {
      message(`Autoplay ${cwplayer.AutoPlay?'':'de'}activated!`);
    } else if (arg == 'Tone') {
      cw_options.tone = cwplayer.Tone;
      saveParams();
    } else if (arg == 'Volume') {
      cw_options.volume = cwplayer.Volume;
      deferredSaveParam();
    } else if (arg == 'KeyingQuality') {
      cw_options.keyqual = cwplayer.KeyingQuality;
      saveParams();
    } else if (arg == 'WPM') {
      selwpm.value = cw_options.wpm = cwplayer.WPM;
      saveParams();
    } else if (arg == 'EffWPM') {
      seleffwpm.value = cw_options.eff = cwplayer.EffWPM;
      saveParams();
    } else if (arg == 'EWS') {
      selews.value = cw_options.ews = cwplayer.EWS;
      saveParams();
    }
  });
  // sur les périphériques à clavier virtuel on rajoute un autre clavier pour les touches spéciales
  // difficilement accessibles sur les claviers virtuels (soft keyboards)
  if (window.mobile = isTouchDevice()) {
    generateKeyboard();
    zonedkb.style.display = 'initial';
    if (document.activeElement === cwtext || document.activeElement === iptfree || document.activeElement === iptlearn) {
      showKeyboard();
    }
    cwtext.addEventListener("focus", showKeyboard);
    iptfree.addEventListener("focus", showKeyboard);
    iptlearn.addEventListener("focus", showKeyboard);
    cwtext.addEventListener("focusout", hideKeyboard);
    iptfree.addEventListener("focusout", hideKeyboard);
    iptlearn.addEventListener("focusout", hideKeyboard);
  }
  modelinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      let mode = e?.srcElement?.dataset.mode;
      cw_options.simple_mode = mode == 'simple';
      cw_options.learn_mode = mode == 'learn';
      if (mode == 'koch') {
        cw_options.freelisten = chkfreelisten.checked = false; // sinon provoque des incompréhensions en changeant d'onglet
      }
      updateValues();
      return false;
    })
  });
  updateValues();
  cheatsheet.addEventListener("click", displayMorseCode);
  morseclosebtn.addEventListener("click", displayMorseCode);
  document.addEventListener("mouseup",  onmouseup);
  selfdl.style.visibility = window.location.href.toLowerCase().startsWith('http') ? 'visible' : 'hidden';
  document.body.addEventListener("keydown",  onkeydown);
  document.body.addEventListener("keyup", onkeyup);
  sellesson.addEventListener("change", updateValues);
  grplen.addEventListener("change", updateValues);
  groupsnb.addEventListener("change", updateValues);
  selwpm.addEventListener("change", () => {
    if (!cwplayer) return;
    cwplayer.WPM = selwpm.value;
    selwpm.value = cwplayer.WPM;
    seleffwpm.value = cwplayer.EffWPM;
  });
  seleffwpm.addEventListener("change", () => {
    if (!cwplayer) return;
    cwplayer.EffWPM = seleffwpm.value;
    seleffwpm.value = cwplayer.EffWPM;
    selwpm.value = cwplayer.WPM;
  });
  selews.addEventListener("change",  () => {
    if (!cwplayer) return;
    cwplayer.EWS = selews.value;
    selews.value = cwplayer.EWS;
  });
  cwsbm.addEventListener("click", verifycw);
  retrybtn.addEventListener("click", updateValues);
  prevlesson.addEventListener("click", () => {
    sellesson.value = Math.min(maxlessons, Math.max(1, parseInt(sellesson.value, 10)-1));
    updateValues();
  });
  nxtlesson.addEventListener("click", () => {
    sellesson.value = Math.min(maxlessons, Math.max(1, parseInt(sellesson.value, 10)+1));
    updateValues();
  });
  chkfreelisten.addEventListener("change", (e) => {
    cw_options.freelisten = chkfreelisten.checked;
    updateValues();
  });
  cwtext.addEventListener("keyup", () => {
    if (!cw_options.freelisten) return;
    cwplayer.Text = cwtext.value;
  });
  iptfree.addEventListener("keyup", verifycw);
  iptlearn.addEventListener("keydown", _ => {
    if (cwchecking) return;
    iptlearn.value='';
  });
  iptlearn.addEventListener("keyup", verifycw);
  cwtitle.addEventListener("dblclick", () => {
    cwplayer.ClearZone = !cwplayer.ClearZone;
    if (cwplayer.ClearZone) {
      message(`Cheating mode activated!`);
    }
  });
  disablekb.addEventListener("change", () => {
    if (disablekb.checked) {
      hideKeyboard();
    }
  });
  chkweightlastletters.addEventListener("change", (e) => {
    cw_options.weighlastletters = chkweightlastletters.checked;
    updateValues();
  });
  if (typeof synth?.onvoiceschanged === 'object') {
    synth.onvoiceschanged = trypopulatevoices;
  }
  trypopulatevoices();
});
window.addEventListener("error", (e) => {
  let err = e;
  let msg = 'unknow error';
  if (e instanceof ErrorEvent) {
    err = `${e.message}`;
    msg = err;
    err += `\n - source: ${e.filename}`;
    err += `\n - lineno: ${e.lineno}`;
    err += `\n - colno: ${e.lineno}`;
    err += `\n - error: ${e.error}`;
  }
  message(msg, 'error');
  console.error(err)
  return false;
});
async function playLetter(letter) {
  if (!window.player2) {
    window.player2 = new CWPlayer(cwplayer.Player.Options);
  } else {
    player2.init(cwplayer.Player.Options);
  }
  player2.PreDelay = 0;
  cwplayer.pause();
  await player2.play(letter);
}
function displayMorseCode(e) {
  let display = csmorse.style.display != 'flex';
  if (typeof e == 'boolean') display = e;
  if (morsecscnt.innerText.trim().length <= 0) {
    //ALPHA NUMBERS SYMBOLS
    let cs = '';
    [[ALPHA,6], [NUMBERS,5], [SYMBOLS,6]].forEach(([cscl,nbrows]) => {
      cs += '<table><tbody><tr>';
      cscl.split('').forEach((s, i) => {
        if (i && i%nbrows == 0) cs += '</tr><tr>';
        cs += `<td>${s}</td><td class="mletter">${CWPlayer.translate(s)}</td>`;
      });
      cs += '</tr></tbody></table>';
    });
    morsecscnt.innerHTML = cs;
    [...morsecscnt.querySelectorAll('td:not(.mletter)')].forEach(td => {
      let elms = [td, td.nextElementSibling];
      let plcl = async e => {
        if (window.player2?.Playing === true) return;//await player2.stop();
        elms.forEach(td => td.classList.add('listening'));
        await playLetter(td.innerText);
        elms.forEach(td => td.classList.remove('listening'));
      };
      elms.forEach(td => td.addEventListener('click', plcl));
    });
  }
  let lessonletters = [];
  let isActive = (l) => lessonletters.includes(l);
  if (cw_options.lesson > 43) {
    isActive = (l) => false;
  } else if (cw_options.lesson <= 40) {
    lessonletters = KOCHCARS.slice(0, cw_options.lesson+1);
  } else if (cw_options.lesson == 41) {
    lessonletters = ALPHA;
  } else if (cw_options.lesson == 42) {
    lessonletters = NUMBERS;
  } else if (cw_options.lesson == 43) {
    lessonletters = SYMBOLS;
  }
  [...morsecscnt.querySelectorAll('td:not(.mletter)')].forEach(td => {
    let elms = [td, td.nextElementSibling];
    let active = isActive(td.innerText);
    let classSelector = (cell) => {
      if (active) {
        cell.classList.add('active');
        cell.title = 'symbol included in current lesson';
      } else {
        cell.classList.remove('active');
        if (cw_options.lesson > 43) {
          cell.removeAttribute('title');
        } else {
          cell.title = 'symbol not included in current lesson';
        }
      }
    };
    elms.forEach(classSelector);
  });
  csmorse.style.display = display?'flex':'none';
  overlayloading.style.display = display?'flex':'none';
  if (display) {
    let scale = 1.0101010101010102; // *0.99 ~= 1
    let csmwcnt = 0, csmw=0, cmpt = 0;
    morsecscnt.style.transform = '';
    csmw = csmorse.getBoundingClientRect().width;
    do {
      scale *= 0.99;
      morsecscnt.style.transform = `scale(${scale})`;
      csmwcnt = morsecscnt.getBoundingClientRect().width;
      if (mobile) csmwcnt+=5;
    } while (csmwcnt > csmw && cmpt++ < 80);
  }
  return false;
}
function onmouseup(e) {
  if (cheatsheet.contains(e.target) || csmorse.contains(e.target)) return;
  displayMorseCode(false);
}
function onkeydown(e) {
  if (!cwplayer) return;
  e = e || window.event;
  let keyCode = e.keyCode || e.which,
      keycodes = {control: 17, escape: 27, space: 32, scrollend: 35, scrolltop: 36, left: 37, up: 38, right: 39, down: 40 },
      keynames = {'ControlLeft': keycodes.control, 'ControlRight': keycodes.control,
      'Escape': keycodes.escape, 'Esc': keycodes.escape, 'Space' : keycodes.space,
      'End' : keycodes.scrollend, 'Home' : keycodes.scrolltop,
      'ArrowLeft' : keycodes.left, 'ArrowUp' : keycodes.up, 'ArrowRight' : keycodes.right, 'ArrowDown' : keycodes.down };
  // on pause via ctrl-space si on est en train de saisir sinon directement space
  let isPlayKeybCtrlOk = e.ctrlKey || !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
  keyCode = keyCode || keynames[e.code];
  if (keyCode == keycodes.escape) {
    displayMorseCode(false);
  } else if (keyCode !== keycodes.control && !cw_options.simple_mode && !cw_options.learn_mode && isPlayKeybCtrlOk) {
    let playControls = {
      [keycodes.space] : 'playpause', 
      [keycodes.scrolltop] : 'backtostart', 
      [keycodes.scrollend] : 'fwdtoend', 
      [keycodes.left] : 'indexdec', 
      [keycodes.right] : 'indexinc'
    };
    Object.keys(playControls).forEach(k => {
      if (keyCode == k) {
        if (keyCode == keycodes.space || cwplayer.Playing || document.activeElement !== cwtext) keystates[playControls[k]] = true;
        if (cwplayer.Playing && document.activeElement === cwtext) e.preventDefault();
      }
    });
  }
}
function onkeyup(e) {
  if (!cwplayer) return;
  if (cw_options.learn_mode || cw_options.simple_mode) {
    Object.keys(keystates).forEach(k => keystates[k] = false);
    return;
  }
  if (keystates.playpause) {
    if (cwplayer.Playing) cwplayer.pause();
    else cwplayer.play();
    keystates.playpause = false;
  }
  if (keystates.backtostart) {
    cwplayer.Index = -1;
    keystates.backtostart = false;
  }
  if (keystates.fwdtoend) {
    cwplayer.Index = cwplayer.Text.length;
    keystates.fwdtoend = false;
  }
  if (keystates.indexdec) {
    cwplayer.Index--;
    keystates.indexdec = false;
  }
  if (keystates.indexinc) {
    cwplayer.Index++;
    keystates.indexinc = false;
  }
}
async function updateValues() {
  if (!cwplayer) return;
  if (cwplayer.Playing) cwplayer.stop();
  [...document.querySelectorAll('#sellesson>option')].forEach(o => {
    if (o.value < 44) return;
    o.disabled = cw_options.simple_mode;
    o.title=cw_options.simple_mode?'disabled in simple mode':'';
  });
  if (cw_options.simple_mode && sellesson.value>43) {
    sellesson.value = 43;
  }
  cwplayer.PreDelay = cw_options.learn_mode || cw_options.simple_mode || cw_options.freelisten ? 0.05 : 2;
  if (cw_options.simple_mode) {
    iptfree.focus();
  } else if (cw_options.learn_mode) {
    iptlearn.focus();
  } else {
    cwtext.focus();
  }
  iptfree.value = cwtext.value = '';
  [...document.querySelectorAll("label[for='seleffwpm'], #seleffwpm")].forEach(e => {
    e.disabled = cw_options.simple_mode || cw_options.learn_mode;
    let title = e.title;
    let dtext = ' - ineffective in simple/learning mode';
    if (e.title.endsWith(dtext)) {
      e.title = e.title.substring(0, e.title.indexOf(dtext));
    }
    if (cw_options.simple_mode || cw_options.learn_mode) {
      e.title = e.title + dtext;
    }
  });
  cw_options.lesson = Math.min(maxlessons, Math.max(1, parseInt(sellesson.value, 10)));
  if (isNaN(cw_options.lesson)) cw_options.lesson = 1;
  cwplayer.WPM = cw_options.wpm = parseInt(selwpm.value, 10);
  cwplayer.EffWPM = cw_options.eff = parseInt(seleffwpm.value, 10);
  cw_options.grouplen = parseInt(grplen.value, 10);
  cw_options.groupsnb = parseInt(groupsnb.value, 10);
  cwplayer.EWS = cw_options.ews = parseFloat(selews.value);
  cwplayer.Tone = cw_options.tone;
  cwplayer.Volume = cw_options.volume;
  cwplayer.KeyingQuality = cw_options.keyqual;
  // on remet à jour les contrôles si'il y'a eu des bornages
  sellesson.value = cw_options.lesson;
  selwpm.value = cw_options.wpm = cwplayer.WPM;
  seleffwpm.value = cw_options.eff = cwplayer.EffWPM;
  selews.value = cw_options.ews = cwplayer.EWS;
  cw_options.tone = cwplayer.Tone;
  cw_options.volume = cwplayer.Volume;
  cw_options.keyqual = cwplayer.KeyingQuality;
  chkfreelisten.checked = cw_options.freelisten;
  chkweightlastletters.checked = cw_options.weighlastletters;
  sellesson.disabled = cw_options.freelisten || cw_options.learn_mode;
  nxtlesson.disabled = cw_options.lesson >= maxlessons || sellesson.disabled;
  prevlesson.disabled = cw_options.lesson <= 1 || sellesson.disabled;
  zoneresult.style.display = 'none';
  zonerestext.innerHTML = '';
  zonefree.style.display = cw_options.simple_mode?'block':'none';
  zonekoch.style.display = !cw_options.simple_mode&&!cw_options.learn_mode?'block':'none';
  zonelearn.style.display = cw_options.learn_mode?'block':'none';
  zonewords.style.display = sellesson.value < 45?'block':'none';
  grplen.disabled = sellesson.value >= 44;
  grplen.title = grplen.disabled ? 'disabled in this mode' : '';
  grplen.previousElementSibling.title = grplen.title;
  chkweightlastletterswrapper.style.display = !cw_options.learn_mode && !cw_options.freelisten && sellesson.value < 41?'block':'none';
  chkfreelistenwrapper.style.visibility = !cw_options.learn_mode?'visible':'hidden';
  speechvoices.style.display = window.anyvoice && cw_options.learn_mode?'block':'none';
  cwsbm.disabled = cw_options.freelisten;
  modelinks.forEach(a => {
    if ((a.dataset.mode == 'simple' && cw_options.simple_mode)
    || (a.dataset.mode == 'koch' && !cw_options.simple_mode && !cw_options.learn_mode)
    || (a.dataset.mode == 'learn' && cw_options.learn_mode)) a.classList.add('active');
    else a.classList.remove('active');
  });
  saveParams();

  await generateText();
  if (cw_options.freelisten) {
    zoneresultfree.innerHTML = '';
    return;
  }
  zoneresultfree.innerHTML = 'Press space to hear first character';
  window.freeerr = 0;
  window.freetotal = 1;
  window.freefirsttry = true;
}
