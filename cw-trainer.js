const SVG_INACTIF = 'svg_inactif';
const HASHSEP = '_';
const FREETEXT_URL = 'https://raw.githubusercontent.com/spasutto/cw-trainer/main/freetext/CharlesDickens-OliverTwist.txt';
var cwchecking = false;
var maxlessons = -1;
var cw_options = {
  lesson : 1,
  grouplen : 5,
  groupsnb : 10,
  freemode: false,
  freelisten: false,
  weighlastletters: false,
  wpm : 25,
  eff : 17,
  ews : 0.5,
  tone : 800,
  keyqual: 1
};
const KOCHCARS = ['K', 'M', 'U', 'R', 'E', 'S', 'N', 'A', 'P', 'T', 'L', 'W', 'I', '.', 'J', 'Z', '=', 'F', 'O', 'Y', ',', 'V', 'G', '5', '/', 'Q', '9', '2', 'H', '3', '8', 'B', '?', '4', '7', 'C', '1', 'D', '6', '0', 'X'];
const ALPHA = "ABCDEFGHIJKLMNPQRSTUVWXYZ";
var QSOs = [
  //http://lidscw.org/resources/cq-qso-template
  'CQ CQ CQ DE %IND1% %IND1% %IND1% PSE K',
  '%IND1% DE %IND2% %IND2% %IND2% KN',
  '%IND2% DE %IND1% = GA ES TNX FER CALL = UR RST %RST1% %RST1% = NAME IS %NAME1% %NAME1% QTH %QTH1% %QTH1% = HW? AR %IND2% DE %IND1% KN',
  '%IND1% DE %IND2% = GA %NAME1% TNX FB RPT UR RST %RST2% %RST2% = OP %NAME2% %NAME2% ES QTH %QTH2% %QTH2% = HW? AR %IND1% DE %IND2% KN',
  '%IND2% DE %IND1% = R TNX RPT ES INFO %NAME2% = RIG IS FTDX1200 PWR 100W ANT IS YAGI = WX IS SUNNY ES WARM 100F = HW? AR %IND2% DE %IND1% KN',
  '%IND1% DE %IND2% = RIG IS FT817 5W ES ANT IS DIPOLE = WX IS WET AND COLD AR %IND1% DE %IND2% KN',
  '%IND2% DE %IND1% = MNI TNX INFO ES FB QSO = PSE QSL VIA BURO = 73 ES CUAGN AR %IND2% DE %IND1% SK',
  '%IND1% DE %IND2% = FB %NAME1% TNX FER NICE QSO 73 ES BCNU AR %IND1% DE %IND2% SK',
  //https://morsecode.ninja/files/Sample-Rag-Chew-QSO-v10.pdf
  'CQ CQ de %IND1% %IND1% K',
  '%IND1% de %IND2% %IND2% K',
  '%IND2% DE %IND1% = GA ES TNX FER THE CALL = UR RST IS %RST1% %RST1% = NAME HR %NAME1% %NAME1% MY QTH IS %QTH1% %QTH1% = HW CPY? %IND2% DE %IND1% KN',
  '%IND1% DE %IND2% R GA %NAME1% TNX FB RPT = RST %RST2% %RST2% = OP HR %NAME2% %NAME2% ES QTH %QTH2% %QTH2% = HW? %IND1% DE %IND2% K',
  'BK NAME? NAME? BK',
  'BK %NAME2% %NAME2% HW? BK',
  '%IND2% DE %IND1% = R R R TNX FER THE RPT ES INFO %NAME2% = MY RIG HR IS KX3 RUNS 100W WID AMP ES ANT IS A 4 ELE YAGI UP 76 FT = WX IS WET AND CO0L 45F = HW NW? %IND2% DE %IND1% K',
  '%IND1% DE %IND2% SOLID COPY %NAME1% = RIG ELECRAFT K3S RUNS KW ANT IS LOOP AT 65 FT = WX SUNNY ES WARM 88F = AGE 70 HAM FOR 40 YEARS = SO HW? %IND1% DE %IND2% KN',
  '%IND2% DE %IND1% = FB COPY %NAME2% WID QSB = AGE HR IS 50 ES BN A HAM FER 6 YRS = RECENTLY RETIRED BUT NW BACK TO WORK AS CERTIFIED TOWER MONKEY = %IND2% DE %IND1% K',
  '%IND1% DE %IND2% FB %NAME1% = RECENTLY RETIRED NURSE ANESTHETIST = LIVING THE DREAM = HW? %IND1% DE %IND2% K',
  '%IND2% DE %IND1% FB %NAME2% = GUD CPY WID MORE QSB HR = TNX FER THE INFO ES QSO = PSE QSL VIA LOTW = 73 ES HPE 2 CU AGN SK %IND2% DE %IND1% K',
  '%IND1% DE %IND2% = FB %NAME1% WL QSL LOTW ES TNX QSO GD 73 AR SK %IND1% DE %IND2% E E',
  //http://naqcc.info/cw_qsos.html
  '%IND1% DE %IND2% GM TNX CALL UR %RST1% %RST1% IN %QTH1% %QTH1% NAME IS %NAME1% %NAME1% HW? AR %IND1% DE %IND2% K',
  '%IND2% DE %IND1% GM %NAME1% UR %RST2% %RST2% IN %QTH2% %QTH2% NAME IS %NAME2% %NAME2% HW? AR %IND2% DE %IND1% KN',
  '%IND1% DE %IND2% R FB %NAME2% NICE TO MEET YOU BT THE RIG HR IS A KNWD TS-570D AT QRP 5W TO AN ATTIC RANDOM WIRE BT THE WX LITE SNOW ES 33 DEGREES HW? AR %IND1% DE %IND2% KN',
  '%IND2% DE %IND1% R FB ON ALL %NAME1% BT THE XYL SAYS SUPPER IS READY SO I MUST GO BT TNX QSO HPE CUL 73 GE SK %IND2% DE %IND1% K',
  '%IND1% DE %IND2% OK %NAME2% WONT HOLD YOU TNX QSO HPE CUAGN VY 73 GE SK %IND1% DE %IND2% E E',
  //http://www.iv3ynb.altervista.org/samplecode.htm
  '%IND2% DE %IND1% GM DR OM ES TNX FER CALL UR RST RST RST IS %RST1% %RST1% FB MY QTH QTH IS %QTH1% %QTH1% MY NAME NAME IS %NAME1% %NAME1% HW ? %IND2% DE %IND1% KN',
  '%IND1% DE %IND2% R R GM DR %NAME1% ES TNX FER RST UR RST RST RST IS 599 599 5NN FB MY QTH QTH QTH IS %QTH2% %QTH2% %QTH2% MY NAME IS %NAME2% %NAME2% %NAME2% HW ? %IND1% DE %IND2% KN',
  '%IND2% DE %IND1% FB DR %NAME2% IN %QTH2% HR RTX IS TS50 TS50 PWR IS %PWR1%W %PWR1%W ANT IS VERT VERT WX WX IS CLOUDY CLOUDY TEMP 15C = NW QRU QRU TNX FER NICE QSO = PSE QSL MY QSL SURE VIA BURO 73 73 ES CUAGN CIAO %IND2% DE %IND1% SK SK  I',
  '%IND1% DE %IND2% R R OK DR %NAME1% FB HR RTX IS YAESU FT920 FT920 ANT IS DIPOLE DIPOLE WX WX FINE TEMP 30C TNX FER FB QSO QSL OK OK 73 73 GL GB %IND1% DE %IND2% SK SK I'
  ];
var keystates = {
  'playpause': false,
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
  let startoftext = 'CHAPTER I';
  let startidx = text?.indexOf(startoftext);
  if (startidx>=0) {
    startidx += startoftext.length;
    text = text.substring(startidx).trim();
  }
  if (typeof text !== 'string' || text.length <= minlength) {
    alert('Unable to load free text (need internet connection !)');
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
  if (!cwplayer) return;
  let cwgentext = '';
  if (!cw_options.freelisten) {
    cwplayer.Text = '';
    if (cw_options.freemode) {
      let maxlesson = Math.min(40, cw_options.lesson);
      let letters = null;
      if (cw_options.lesson == 41) {
        letters = ALPHA.split('');
      } else {
        letters = KOCHCARS.slice(0, maxlesson+1);
        if (cw_options.weighlastletters) {
          // lettres "nouvelles"
          let newletters = KOCHCARS.slice(Math.max(0, maxlesson-2), maxlesson+1);
          // plus de poids pour les lettres nouvelles
          let nbi = Math.max(1, Math.round(maxlesson/8));
          for(let i=0; i<nbi; i++) letters.push(...newletters);
        }
      }
      cwgentext = generateRandomString(letters, 1);
    } else if (cw_options.lesson==42) {
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
          .replaceAll('%RST1%', ''+irand(1, 5)+irand(1, 9)+irand(1, 9))
          .replaceAll('%RST2%', ''+irand(1, 5)+irand(1, 9)+irand(1, 9))
          .replaceAll('%PWR1%', ''+irand(1, 10)*10)
          .replaceAll('%PWR2%', ''+irand(1, 10)*10);
    } else if (cw_options.lesson==43) {
      cwgentext = await generateFreeText();
    } else {
      let maxlesson = Math.min(40, cw_options.lesson);
      let letters = null;
      if (cw_options.lesson == 41) {
        letters = ALPHA.split('');
      } else {
        letters = KOCHCARS.slice(0, maxlesson+1);
        if (cw_options.weighlastletters) {
          // lettres "nouvelles"
          let newletters = KOCHCARS.slice(Math.max(0, maxlesson-2), maxlesson+1);
          // plus de poids pour les lettres nouvelles
          let nbi = Math.max(1, Math.round(maxlesson/8));
          for(let i=0; i<nbi; i++) letters.push(...newletters);
        }
      }
      cwgentext = generateRandomText(letters, cw_options.grouplen, cw_options.groupsnb);
    }
    cwplayer.Text = cwgentext;
    return cwgentext;
  } else {
    cwplayer.Text = cw_options.freemode ? iptfree.value : cwtext.value;
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
  var sequences = {};
  if (str1 && str2) {
    var str1Length = str1.length,
      str2Length = str2.length,
      num = new Array(str1Length),
      idx = null;
  
    for (var i = 0; i < str1Length; i++) {
      var subArray = new Array(str2Length);
      for (var j = 0; j < str2Length; j++)
        subArray[j] = 0;
      num[i] = subArray;
    }
    for (var i = 0; i < str1Length; i++)
    {
      for (var j = 0; j < str2Length; j++)
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
  // suppression des séquences qui apparaissent dans le désordre dans la chaine test par rapport à la chaine d'entrée (ainsi que les doublons, ex 'KMKMM/NNNK')
  for (let i=0; i<sequences.length;i++) {
    let s = sequences[i];
    if (sequences.some((s2, i2) => i2 < i && (s2.idst == s.idst || s2.isrc == s.isrc))) {
      sequences.splice(i, 1);
      i--;
    }
  }
  // suppression des overlaps : compareStrings("IVNVV", "IVVV")
  sequences = sequences.filter((s,i) => !sequences.some((s2,i2) => i2>i && (s.isrc==s2.isrc || s.idst==s2.idst)));
  return {'str1':str1, 'str2':str2, 'errors':str1.length-sequences.reduce((acc, cur) => acc+=cur.text.length, 0), 'sequences': sequences};
}
const emptyChar = '&nbsp;';//'_';
function formatTestString(ret) {
  let sret = '';
  let sequences = ret.sequences, str1=ret.str1, str2=ret.str2;
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
    let curl = 0;
    sequences.forEach(s => {
      if (s.idst > curl) {
        // affichage de tous les caractères de la chaine de test qui ne sont pas en préambule dans la chaine d'entrée
        sret += `<span class="wrong">${str2.substring(curl, s.idst)}</span>`;
        curl+=(s.idst-curl);
      }
      if (s.isrc > curl) {
        // affichage de tous les caractères de la chaine d'entrée qui ne sont pas en préambule dans la chaine de test
        sret += `<span class="empty">${emptyChar.repeat(s.isrc-curl)}</span>`;
        curl+=(s.isrc-curl);
      }
      sret += `<span class="right">${s.text}</span>`;
      curl+=s.text.length;
    });
    let slast = sequences[sequences.length-1];
    let suffix = 0;
    if (slast.idst+slast.text.length < str2.length) {
      sret += `<span class="wrong">${str2.substring(slast.idst+slast.text.length)}</span>`;
      suffix += str2.length-(slast.idst+slast.text.length);
    }
    if (slast.isrc+slast.text.length+suffix < str1.length) {
      sret += `<span class="empty">${emptyChar.repeat(str1.length-(slast.isrc+slast.text.length+suffix))}</span>`;
    }
  }
  return sret;
}
function key(value) {
  if (overlayloading.style.display==='flex') return;
  if (chkfree.checked) {
    iptfree.value+=value;
    iptfree.focus();
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
async function verifycw() {
  if (!cwplayer || cwchecking) return;
  cwchecking = true;
  if (chkfree.checked) {
    if (iptfree.value?.length != 1) {
      cwchecking = false;
      return; // controls keys
    }
    iptfree.classList.add('nocarret');
    if (chkfreelisten.checked || iptfree.value==' ') {
      cwplayer.stop();
      iptfree.classList.add('blue');
      cwplayer.play(chkfreelisten.checked?iptfree.value:null).then(() => {
        iptfree.classList.remove('blue');
        iptfree.classList.remove('nocarret');
        iptfree.value = '';
        iptfree.focus();
        cwchecking = false;
      });
      return;
    }
    if (iptfree.value.toUpperCase() != cwplayer.Text[0]) {
      iptfree.classList.add('error');
      CWPlayer.delay(0.35).then(() => {
        iptfree.classList.remove('error');
        iptfree.classList.remove('nocarret');
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
      CWPlayer.delay(0.35).then(() => {
        iptfree.classList.remove('ok');
        iptfree.classList.remove('nocarret');
        iptfree.value = '';
      });
      generateText();
      cwplayer.play();
      window.freetotal++;
      window.freefirsttry = true;
    }
    
    zoneresultfree.innerHTML = `Success rate : ${Math.round((100*(freetotal-freeerr)/freetotal)*10)/10}% (${window.freetotal-1} symbols)`;

    iptfree.focus();
  } else {
    if (chkfreelisten.checked) {
      return;
    }
    if (cwplayer.Playing) cwplayer.stop();
    cwsbm.disabled = true;
    let extractfn = (t) => [CWPlayer.cleanText(t.trim()).replaceAll('\t', ' ')];
    // hormis pour les QSOs on travaille par mot => on recompare mot par mot
    if (cw_options.lesson <= 41) {
      extractfn = (t) => CWPlayer.cleanText(t.trim()).replaceAll('\t', ' ').split(' ').filter(e => e.length > 0);
    }
    let inpt = extractfn(cwtext.value);
    let verif = extractfn(cwplayer.Text);
    let results = verif.map((a, i) => compareStrings(a, inpt[i] ?? ''));
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
        results = verif.map((a, i) => compareStrings(a, inpt[i] ?? ''));
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
            results = verif.map((a, i) => compareStrings(a, inpttmp[i] ?? ''));
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
          results = verif.map((a, i) => compareStrings(a, inpt[i] ?? ''));
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
      if (cw_options.lesson <= 41) {
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
  
    retrynxt.style.display = perc>=90?'inline-block':'none';
    zoneresult.style.display = 'inline-block';
    keyboard.style.display = 'none';
  }
  cwsbm.disabled = false;
  cwchecking = false;
}
async function listen(text, elem) {
  if (cwplayer.Playing) {
    return ;
  }
  [...document.querySelectorAll('a[name="listen"]')].forEach(e => e.classList.remove('active'));
  if (elem) elem.classList.add('active');
  cwsbm.disabled = true;
  cwplayer.PreDelay=0.05;
  cwplayer.play(text);
}
async function selfDownload() {
  loading();
  let dlpromises = [getUrl(window.location.href, true)];
  if (confirm('Include Oliver Twist (required for offline free text mode)?\nThis will add ~1MB to the final page.')) {
    dlpromises.push(getUrl(FREETEXT_URL, true));
  }
  let [page, ot] = await Promise.all(dlpromises);
  if (!page) {
    message('no connection !', 'error');
    loading(false);
    return;
  }
  const regscript = /<script\s+src\s*=\s*"([^"]+)"\s*>\s*<\/script>/gi;
  let occ = [...page.matchAll(regscript)];
  for (let i=0; i<occ.length; i++) {
    let script = await getUrl(occ[i][1], true);
    if (script) {
      page = page.replace(occ[i][0], '\u003cscript\u003e\n'+script.replaceAll('$', '$$$$')+'\u003c/script\u003e')
    }
  }
  const regstyle = /<link\s+[^>]*href\s*=\s*"([^"]+)"[^>]*>/gi;
  occ = [...page.matchAll(regstyle)];
  for (let i=0; i<occ.length; i++) {
    let binary = occ[i][0].indexOf('icon') > -1;
    let data = await getUrl(occ[i][1], true, binary) ?? '';
    if (binary) {
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
  if (ot) {
    page = page.replace('\u003c/body\u003e', '\u003cscript\u003e\nvar freetext = `'+ot.replaceAll('$', '$$$$').replaceAll('`', '\\`')+'`;\n\u003c/script\u003e\n\u003c/body\u003e')
  }
  var url = window.URL.createObjectURL(new Blob([page], {type: 'text/plain'}));
  var a = document.createElement('a');
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
  seltone.min = CWPlayer.MIN_TONE;
  seltone.max = CWPlayer.MAX_TONE;
  selkeyqual.min = CWPlayer.MIN_KEYQUAL;
  selkeyqual.max = CWPlayer.MAX_KEYQUAL;
}
function saveParams() {
  let params = encodeURIComponent(sellesson.value+HASHSEP+selwpm.value+HASHSEP+seleffwpm.value+HASHSEP+grplen.value+HASHSEP+groupsnb.value+HASHSEP+seltone.value+HASHSEP+selews.value+HASHSEP+(chkfree.checked?1:0)+HASHSEP+(chkfreelisten.checked?1:0)+HASHSEP+(chkweightlastletters.checked?1:0)+HASHSEP+selkeyqual.value);
  try {
    localStorage.setItem("params", params);
  } catch(e) {}
  window.location.hash = params;
}
function loadParams() {
  let params = window.location.hash.substring(1);
  if (params.trim().length <=0) {
    try {
      params = localStorage.getItem("params");
    } catch(e) {}
  }
  decodeURIComponent(params).split(HASHSEP).forEach((val, i) => {
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
        chkfree.checked = val === 1;
        break;
      case 8:
        chkfreelisten.checked = val === 1;
        break;
      case 9:
        chkweightlastletters.checked = val === 1;
        break;
      case 10:
        cw_options.keyqual = Math.max(CWPlayer.MIN_KEYQUAL, Math.min(CWPlayer.MAX_KEYQUAL, val));
        break;
    }
  });
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
window.onload = async () => {
  setMinMax();
  window.maxlessons = Math.max.apply(null, [...document.querySelectorAll('#sellesson>option')].map(o => parseInt(o.value, 10)));
  loadParams();
  sellesson.value = cw_options.lesson;
  selwpm.value = cw_options.wpm;
  seleffwpm.value = cw_options.eff;
  grplen.value = cw_options.grouplen;
  groupsnb.value = cw_options.groupsnb;
  seltone.value = cw_options.tone;
  selkeyqual.value = cw_options.keyqual;
  selews.value = cw_options.ews;
  cwplayer.addEventListener('play', () => {
    // on ne focus le texte que si on vient de démarrer la lecture, qu'on est en mode normal et qu'on est pas en train d'écouter un résultat
    if (!chkfree.checked && !chkfreelisten.checked && !document.querySelectorAll('.active').length && cwplayer.CurrentTime < 0.5) {
      cwtext.focus();
    }
  });
  cwplayer.addEventListener('parameterchanged', (arg) => {
    if (arg == 'AutoPlay') {
      message(`Autoplay ${cwplayer.AutoPlay?'':'de'}activated!`);
    }
  });
  // sur les périphériques à clavier virtuel on rajoute un autre clavier pour les touches spéciales
  // difficilement accessibles sur les claviers virtuels (soft keyboards)
  if (isTouchDevice()) {
    generateKeyboard();
    zonedkb.style.display = 'initial';
    if (document.activeElement === cwtext || document.activeElement === iptfree) {
      showKeyboard();
    }
    cwtext.addEventListener("focus", showKeyboard);
    iptfree.addEventListener("focus", showKeyboard);
    cwtext.addEventListener("focusout", hideKeyboard);
    iptfree.addEventListener("focusout", hideKeyboard);
    document.addEventListener("touchstart", document.onmousedown);
    document.addEventListener("touchend", document.onmouseup);
    document.addEventListener("touchcancel", document.onmouseup);
    document.addEventListener("touchmove", document.onmousemove);
  }
  updateValues();
  selfdl.style.visibility = window.location.href.toLowerCase().startsWith('http') ? 'visible' : 'hidden';
  document.body.onkeydown = onkeydown;
  document.body.onkeyup = onkeyup;
  chkfree.onchange = updateValues;
  sellesson.onchange = updateValues;
  grplen.onchange = updateValues;
  groupsnb.onchange = updateValues;
  selwpm.onchange = () => {
    if (!cwplayer) return;
    cwplayer.WPM = selwpm.value;
    selwpm.value = cwplayer.WPM;
    seleffwpm.value = cwplayer.EffWPM;
    saveParams();
  };
  seleffwpm.onchange = () => {
    if (!cwplayer) return;
    cwplayer.EffWPM = seleffwpm.value;
    seleffwpm.value = cwplayer.EffWPM;
    selwpm.value = cwplayer.WPM;
    saveParams();
  };
  selews.onchange = () => {
    if (!cwplayer) return;
    cwplayer.EWS = selews.value;
    selews.value = cwplayer.EWS;
    saveParams();
  };
  seltone.onchange = () => {
    if (!cwplayer) return;
    cwplayer.Tone = seltone.value;
    seltone.value = cwplayer.Tone;
    saveParams();
  }
  cwsbm.onclick = verifycw;
  retrybtn.onclick = updateValues;
  prevlesson.onclick = () => {
    sellesson.value = Math.min(maxlessons, Math.max(1, parseInt(sellesson.value, 10)-1));
    updateValues();
  };
  nxtlesson.onclick = () => {
    sellesson.value = Math.min(maxlessons, Math.max(1, parseInt(sellesson.value, 10)+1));
    updateValues();
  };
  selkeyqual.onchange = () => {
    if (!cwplayer) return;
    cwplayer.KeyingQuality = selkeyqual.value;
    selkeyqual.value = cwplayer.KeyingQuality;
    saveParams();
  }
  chkfreelisten.onchange = updateValues;
  cwtext.onkeyup = () => {
    if (!chkfreelisten.checked) return;
    cwplayer.Text = cwtext.value;
  }
  iptfree.onkeyup = verifycw;
  cwtitle.ondblclick = () => {
    cwplayer.DisplayClearZone = !cwplayer.DisplayClearZone;
    if (cwplayer.DisplayClearZone) {
      message(`Cheating mode activated!`);
    }
  }
  disablekb.onchange = () => {
    if (disablekb.checked) {
      hideKeyboard();
    }
  }
  chkweightlastletters.onchange = updateValues;
};
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
function onkeydown(e) {
  if (!cwplayer) return;
  e = e || window.event;
  let keyCode = e.keyCode || e.which,
      keys = {space: 32, left: 37, up: 38, right: 39, down: 40 };
  // on pause via ctrl-space si on est en train de saisir sinon directement space
  let ctrl = e.ctrlKey || !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
  if (ctrl && keyCode != 17) { //17 == left ctrl
    switch (keyCode) {
      case keys.space:
        keystates.playpause = true;
        break;
      case keys.left:
        keystates.indexdec = true;
        break;
      case keys.right:
        keystates.indexinc = true;
        break;
    }
  }
}
function onkeyup(e) {
  if (!cwplayer) return;
  e = e || window.event;
  let keyCode = e.keyCode || e.which;
  if (keyCode == 27) { // echap
    [...document.querySelectorAll(MorsePlayer.TAG)].forEach(m => m.mouseup());
  }
  if (keystates.playpause) {
    if (cwplayer.Playing) cwplayer.pause();
    else cwplayer.play();
    keystates.playpause = false;
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
    if (o.value < 42) return;
    o.disabled = chkfree.checked;
    o.title=chkfree.checked?'disabled in simple mode':'';
  });
  if (chkfree.checked && sellesson.value>41) {
    sellesson.value = 41;
  }
  cwplayer.PreDelay = chkfree.checked || chkfreelisten.checked ? 0.05 : 2;
  if (chkfree.checked) {
    iptfree.focus();
  } else {
    cwtext.focus();
  }
  iptfree.value = cwtext.value = '';
  [...document.querySelectorAll("label[for='seleffwpm'], #seleffwpm")].forEach(e => {
    e.disabled = chkfree.checked;
    let title = e.title;
    let dtext = ' - ineffective in free mode';
    if (e.title.endsWith(dtext)) {
      e.title = e.title.substring(0, e.title.indexOf(dtext));
    }
    if (chkfree.checked) {
      e.title = e.title + dtext;
    }
  });
  cw_options.freemode = chkfree.checked;
  cw_options.freelisten = chkfreelisten.checked;
  cw_options.weighlastletters = chkweightlastletters.checked;
  cw_options.lesson = Math.min(maxlessons, Math.max(1, parseInt(sellesson.value, 10)));
  if (isNaN(cw_options.lesson)) cw_options.lesson = 1;
  cwplayer.WPM = cw_options.wpm = parseInt(selwpm.value, 10);
  cwplayer.EffWPM = cw_options.eff = parseInt(seleffwpm.value, 10);
  cw_options.grouplen = parseInt(grplen.value, 10);
  cw_options.groupsnb = parseInt(groupsnb.value, 10);
  cwplayer.EWS = cw_options.ews = parseFloat(selews.value);
  cwplayer.Tone = cw_options.tone = parseInt(seltone.value, 10);
  cwplayer.KeyingQuality = cw_options.keyqual = parseFloat(selkeyqual.value);
  // on remet à jour les contrôles si'il y'a eu des bornages
  sellesson.value = cw_options.lesson;
  selwpm.value = cw_options.wpm = cwplayer.WPM;
  seleffwpm.value = cw_options.eff = cwplayer.EffWPM;
  selews.value = cw_options.ews = cwplayer.EWS;
  seltone.value = cw_options.tone = cwplayer.Tone;
  selkeyqual.value = cw_options.keyqual = cwplayer.KeyingQuality;
  sellesson.disabled = chkfreelisten.checked;
  nxtlesson.disabled = cw_options.lesson >= maxlessons || chkfreelisten.checked;
  prevlesson.disabled = cw_options.lesson <= 1 || chkfreelisten.checked;
  zoneresult.style.display = 'none';
  zonerestext.innerHTML = '';
  zonefree.style.display = chkfree.checked?'block':'none';
  zonekoch.style.display = !chkfree.checked?'block':'none';
  zonewords.style.display = sellesson.value < 42?'block':'none';
  chkweightlastletterswrapper.style.visibility = !cw_options.freelisten && sellesson.value < 41?'visible':'hidden';
  cwsbm.disabled = chkfreelisten.checked;
  saveParams();

  await generateText();
  if (chkfreelisten.checked) {
    zoneresultfree.innerHTML = '';
    return;
  }
  zoneresultfree.innerHTML = 'Press space to hear first character';
  window.freeerr = 0;
  window.freetotal = 1;
  window.freefirsttry = true;
}
