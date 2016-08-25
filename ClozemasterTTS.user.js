// ==UserScript==
// @name        ClozemasterTTS
// @namespace   https://github.com/camiloaa/clozemastertts
// @description Add different TTS options to Clozemaster
// @include     https://www.clozemaster.com/*
// @author      Camilo Arboleda
// @version     0.1
// @grant       none
// ==/UserScript==


function tryagain() {
    hideSoundErrorBox();
    audio.load();
}

function hideSoundErrorBox() {
    soundErrorBox.style.display = "none";
}

function displaySoundErrorBox(url) {
    var container = document.getElementsByClassName("player-container")[0];
    container.insertBefore(soundErrorBox, container.firstChild);
    document.getElementById("sound-error-link").href = url;
    soundErrorBox.style.display = "";
    document.getElementById("sound-error-button").onclick = tryagain;
}

/* Audio functions */

var audio;
var prevAudio;
var waiting = false;
var counter = 0;

// Play an audio element.
function playURL(url) {
    counter = counter + 1;
    if(prevAudio){ prevAudio.destruct(); }
    prevAudio = audio;
    waiting = (prevAudio && prevAudio.playState == 1);
    // race condition here…
    audio = soundManager.createSound({
        id: "sound-" + counter,
        url: url,
        autoLoad: true,
        onload: function() {
            if(this.readyState == 2){
                displaySoundErrorBox(this.url);
            } else if(!waiting){
                this.play();
            }
        },
        onfinish: function () {
            if(waiting) {
                waiting = false;
                this.play();
            }
        }
    });
}

// Play a sentence using the first available TTS
function playSound(sentence, lang, slow) {
	var url = "";
	for (i = 0; i < sayFuncOrder.length; i++) {
		try {
			// console.log("loop " + sayFuncOrder[i]);
			if (sayFunc[sayFuncOrder[i]](sentence, lang, slow)) {
				break;
			}
		} catch (err) {
			// Do nothing, I don't care
		}
	}
}

var sentenceGlobal = null;
var lastSaidSlow = false;

// Google TTS Functions
// ====================
//
function googleTTSLang(targetLang) {
    if (targetLang == "dn") { return "nl"; }
    if (targetLang == "zs") { return "zh"; }
    return targetLang;
}

function googleSay(sentence, lang, slow) {

    // Create Google TTS in a way that it doesn't get tired that quickly.
    var gRand = function () { return Math.floor(Math.random() * 1000000) + '|' +
                                       Math.floor(Math.random() * 1000000) };
    url = "http://translate.google.com/translate_tts?ie=UTF-8&tl=" + googleTTSLang(lang) +
          "&total=1&textlen=" + sentence.length + "&tk=" + gRand() +
          "&q=" + encodeURIComponent(sentence) + "&client=tw-ob";
    if (slow) url = url + "&ttsspeed=0"
    playURL(url);
    return true;
}

// Yandex TTS Functions
// ====================
//
function yandexTTSLang(targetLang) {
	switch (targetLang) {
	case 'ar': return 'ar_AE';
	case 'ca': return 'ca_ES';
	case 'cs': return 'cs_CZ';
	case 'da': return 'da_DK';
	case 'de': return 'de_DE';
	case 'el': return 'el_GR';
	case 'en': return 'en_GB';
	case 'es': return 'es_ES';
	case 'fi': return 'fi_FI';
	case 'fr': return 'fr_FR';
	case 'it': return 'it_IT';
	case 'dn': return 'nl_NL';
	case 'no': return 'no_NO';
	case 'pl': return 'pl_PL';
	case 'pt': return 'pt_PT';
	case 'ru': return 'ru_RU';
	case 'se': return 'sv_SE';
	case 'tr': return 'tr_TR';
	}
	return undefined;
};

function yandexSay(sentence, lang, speed) {
	var sayLang = yandexTTSLang(lang);
	if (sayLang != undefined) {
		url = 'http://tts.voicetech.yandex.net/tts?text=' + sentence +
			'&lang=' + sayLang + '&format=mp3&quality=hi';
		playURL(url);
		return true;
	}
	return false;
};

// Baidu TTS Functions
// ====================

// Duolingo to Baidu language codes
function baiduTTSLang(targetLang) {
	switch (targetLang) {
	case 'en': return 'en'; // American English
	case 'es': return 'es'; // Spanish
	case 'pt': return 'pt'; // Portuguese
	case 'zs': return 'zh'; // Chinese
	}
	return undefined;
};

function baiduSay(sentence, lang, speed) {
	var sayLang = baiduTTSLang(lang);
	if (sayLang != undefined) {
		url = 'http://tts.baidu.com/text2audio?text=' + sentence +
			'&lan=' + sayLang + '&ie=UTF-8';
		playURL(url);
		return true;
	}
	return false;
}

// Setup MS TTS
tts_req = document.createElement("li");
tts_ans = document.createElement("li");

function ansObserver() {
	url = tts_ans.getAttribute("data-value");
	playURL(url);
}

function BingSetup() {
	var MutationObserver = window.MutationObserver ||
	                       window.WebKitMutationObserver ||
	                       window.MozMutationObserver;
	var observerConfig = {
			attributes: true,
			childList: true,
			subree: true,
			};

	tts_req.setAttribute("type", "hidden");
	tts_req.setAttribute("id", "bing-tts-request");
	tts_req.setAttribute("data-value", " ");
	document.body.appendChild(tts_req);

	tts_ans.setAttribute("type", "hidden");
	tts_ans.setAttribute("id", "bing-tts-answer");
	tts_ans.setAttribute("data-value", " ");
	document.body.appendChild(tts_ans);

	answerObserver = new MutationObserver(ansObserver);
	answer = document.getElementById("bing-tts-answer");
	answerObserver.observe(answer, observerConfig);
}

function bingSay(sentence, lang, slow) {
	request = document.getElementById("bing-tts-request");
	url = "language=" + googleTTSLang(lang) + "&text=" + sentence;
	request.setAttribute("data-value", url);
	return true;
}

// List of supported TTS providers
var sayFunc = new Array();
sayFunc['baidu']  = baiduSay;
sayFunc['bing']   = bingSay;
sayFunc['google'] = googleSay;
sayFunc['yandex'] = yandexSay;
var sayFuncOrder = [ 'bing', 'baidu', 'yandex', 'google', ];

// Say a sentence
function say(sentence, lang) {
    sentence = sentence.replace(/•/g,"");
    console.debug("Clozemaster saying '" + sentence + "'");
    sentenceGlobal = sentence;
    playSound(sentence, lang, false);
    lastSaidSlow = false;
    lastSaidLang = lang;
}

// Repeat las sentece slowly
function sayslow(lang) {
    var sentence = sentenceGlobal;
    console.debug("Clozemaster saying slowly '" + sentence + "'");
    playSound(sentenceGlobal, lang, true);
    lastSaidSlow = true;
    lastSaidLang = lang;
}
