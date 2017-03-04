// ==UserScript==
// @name        ClozemasterTTS
// @namespace   https://github.com/camiloaa/clozemastertts
// @description Add different TTS options to Clozemaster
// @include     https://www.clozemaster.com/languages*
// @author      Camilo Arboleda
// @version     0.4
// @downloadURL  https://github.com/camiloaa/ClozemasterTTS/raw/master/ClozemasterTTS.user.js
// @updateURL  https://github.com/camiloaa/ClozemasterTTS/raw/master/ClozemasterTTS.user.js
// @grant       none
// ==/UserScript==


// Here comes user configuration!
// Sorry, no UI yet

var ttsEngine = new Array();
ttsEngine['en'] = 'baidu';
ttsEngine['es'] = 'baidu';
ttsEngine['zh'] = 'baidu';
ttsEngine['pt'] = 'yandex';
ttsEngine['pl'] = 'yandex';
ttsEngine['fr'] = 'yandex';
ttsEngine['it'] = 'yandex';
ttsEngine['de'] = 'yandex';

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

	console.log("Playing URL " + url);
	audio = document.getElementById("audio-userscript-cm");

	if (audio != null) {
		// Delete audio element
		document.body.parentNode.removeChild(audio);
	}
	audio = document.createElement('audio');
	audio.setAttribute("id", "audio-userscript-cm")
	audio.setAttribute("autoplay", "true")
	source = document.createElement('source');
	source.setAttribute("type", "audio/mpeg");
	audio.appendChild(source);
	document.body.parentNode.insertBefore(audio, document.body);
	source.setAttribute("src", url);

	audio.load();
}

var sentenceGlobal = null;

var lang3to2 = new Array();
lang3to2['cmn'] = 'zh';
lang3to2['deu'] = 'de';
lang3to2['eng'] = 'en';
lang3to2['pol'] = 'pl';
lang3to2['por'] = 'pt';
lang3to2['fra'] = 'fr';
lang3to2['spa'] = 'es';
lang3to2['ita'] = 'it';

// Google TTS Functions
// ====================
//
function googleTTSLang(targetLang) {
	if (targetLang == "dn") {
		return "nl";
	}
	if (targetLang == "zs") {
		return "zh";
	}
	return targetLang;
}

function googleSay(sentence, lang) {

	// Create Google TTS in a way that it doesn't get tired that quickly.
	var gRand = function() {
		return Math.floor(Math.random() * 1000000) + '|'
				+ Math.floor(Math.random() * 1000000)
	};
	url = "http://translate.google.com/translate_tts?ie=UTF-8&tl="
			+ googleTTSLang(lang) + "&total=1&textlen=" + sentence.length
			+ "&tk=" + gRand() + "&q=" + encodeURIComponent(sentence)
			+ "&client=tw-ob";
	if (slow)
		url = url + "&ttsspeed=0"
	playURL(url);
	return true;
}

// Yandex TTS Functions
// ====================
//
function yandexTTSLang(targetLang) {
	switch (targetLang) {
	case 'ar':
		return 'ar_AE';
	case 'ca':
		return 'ca_ES';
	case 'cs':
		return 'cs_CZ';
	case 'da':
		return 'da_DK';
	case 'de':
		return 'de_DE';
	case 'el':
		return 'el_GR';
	case 'en':
		return 'en_GB';
	case 'es':
		return 'es_ES';
	case 'fi':
		return 'fi_FI';
	case 'fr':
		return 'fr_FR';
	case 'it':
		return 'it_IT';
	case 'dn':
		return 'nl_NL';
	case 'no':
		return 'no_NO';
	case 'pl':
		return 'pl_PL';
	case 'pt':
		return 'pt_PT';
	case 'ru':
		return 'ru_RU';
	case 'se':
		return 'sv_SE';
	case 'tr':
		return 'tr_TR';
	}
	return undefined;
};

function yandexSay(sentence, lang) {
	var sayLang = yandexTTSLang(lang);
	if (sayLang != undefined) {
		url = 'http://tts.voicetech.yandex.net/tts?text=' + sentence + '&lang='
				+ sayLang + '&format=mp3&quality=hi';
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
	case 'en':
		return 'en'; // American English
	case 'es':
		return 'es'; // Spanish
	case 'pt':
		return 'pt'; // Portuguese
	case 'zh':
		return 'zh'; // Chinese
	}
	return undefined;
};

function baiduSay(sentence, lang) {
	var sayLang = baiduTTSLang(lang);
	if (sayLang != undefined) {
		url = 'http://tts.baidu.com/text2audio?text=' + sentence + '&lan='
				+ sayLang + '&ie=UTF-8';
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
	var MutationObserver = window.MutationObserver
			|| window.WebKitMutationObserver || window.MozMutationObserver;
	var observerConfig = {
		attributes : true,
		childList : true,
		subree : true,
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

function bingSay(sentence, lang) {
	request = document.getElementById("bing-tts-request");
	url = "language=" + googleTTSLang(lang) + "&text=" + sentence;
	request.setAttribute("data-value", url);
	return true;
}

// List of supported TTS providers
var sayFunc = new Array();
sayFunc['baidu'] = baiduSay;
sayFunc['bing'] = bingSay;
sayFunc['google'] = googleSay;
sayFunc['yandex'] = yandexSay;
// Say a sentence
function say(sentence, lang) {
	sentence = sentence.replace(/•/g, "");
	console.debug("Clozemaster saying '" + sentence + "' in ", lang);
	sentenceGlobal = sentence;

	var url = "";
	try {
		engine = ttsEngine[lang];
		// console.log("loop " + engine);
		sayFunc[engine](sentence, lang);
	} catch (err) {
		console.log("Unable to speak in " + lang);
	}

	lastSaidLang = lang;
}

function keyUpHandler(e) {
	if (e.shiftKey && e.keyCode == 82 && audio) {
		audio.play();
	} else {
		// Nothing happens
	}
}

document.addEventListener('keyup', keyUpHandler, false);

function onChange() {
	input_value = document.getElementsByClassName("input")[0].value;
	
	if (input_value != "") {
		pre_value = document.getElementsByClassName("pre")[0].innerText;
		post_value = document.getElementsByClassName("post")[0].innerText;
		lang_pair = window.location.pathname.split('/')[2].split('-');
		console.log("Saying: ", pre_value + input_value + post_value)

		say(pre_value + input_value + post_value, lang3to2[lang_pair[0]]);
	}
}

input_field = document.getElementsByClassName("input")[0];

new MutationObserver(onChange).observe(input_field, {
	attributes : true,
	childList : true,
	subtree : true,
	characterData : true
});

setTimeout(BingSetup, 1500);
