// ==UserScript==
// @name        ClozemasterTTS
// @namespace   https://github.com/camiloaa/clozemastertts
// @description Add different TTS options to Clozemaster
// @include     https://www.clozemaster.com/languages*
// @exclude     https://www.clozemaster.com/languages/*skill=listening*
// @author      Camilo Arboleda
// @version     0.7.3
// @downloadURL  https://github.com/camiloaa/ClozemasterTTS/raw/master/ClozemasterTTS.user.js
// @updateURL  https://github.com/camiloaa/ClozemasterTTS/raw/master/ClozemasterTTS.user.js
// @grant       none
// ==/UserScript==


// Here comes user configuration!
// Sorry, no UI yet

var ScriptState = JSON.parse(localStorage.getItem('closetts.state'));
if (ScriptState == null) {
	ScriptState = {};  // Empty object
}

var ENABLE_AUTOPLAY = true;
var ttsEngine = new Array();
ttsEngine['en'] = 'baidu';
ttsEngine['es'] = 'baidu';
ttsEngine['zh'] = 'baidu';
ttsEngine['pt'] = 'baidu';
ttsEngine['pl'] = 'google';
ttsEngine['fr'] = 'google';
ttsEngine['it'] = 'google';
ttsEngine['de'] = 'google';

function tryagain() {
	hideSoundErrorBox();
	audio.load();
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
		// console.log("removing audio")
		parent = audio.parentNode;
		parent.removeChild(audio);
	}

	// New audio
	audio = document.createElement('audio');
	audio.setAttribute("id", "audio-userscript-cm");
	if (ENABLE_AUTOPLAY) {
		audio.setAttribute("autoplay", "yes");
	}
	var source = document.createElement('source');
	source.setAttribute("type", "audio/mpeg");
	source.setAttribute("src", url);
	audio.appendChild(source);

	try {
		// New play button
		var controls=document.getElementsByClassName("controls")[0];
		var button = document.getElementById("audio-userscript-cm-button");
		if (button == null) {
			button = document.createElement("button");
			button.className = "btn btn-default control";
			button.setAttribute("id", "audio-userscript-cm-button");
			var span = document.createElement("span");
			span.className = "glyphicon glyphicon-volume-up";
			button.appendChild(span);
			controls.appendChild(button);
		}

		button.appendChild(audio);
		button.onclick = function() {
			document.getElementById('audio-userscript-cm').play();
		};

		// Replace cloze-master play button
		var oldbutton = document.getElementsByClassName("btn btn-default play-sentence-audio control")[0];
		oldbutton.style.display = "none"; // Hide old button if exist
	} catch(err) {
		// Unable to replace Clozemaster's button
		// Just place the audio somewhere and hope for the best
		document.body.parentNode.insertBefore(audio, document.body);
	}

	// audio.load();
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
function googleSay(sentence, lang) {

	// Create Google TTS in a way that it doesn't get tired that quickly.
	var gRand = function() {
		return Math.floor(Math.random() * 1000000) + '|'
				+ Math.floor(Math.random() * 1000000)
	};
	url = "http://translate.google.com/translate_tts?ie=UTF-8&tl="
			+ lang + "&total=1&textlen=" + sentence.length
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
	// console.log("Yandex " + sayLang);
	if (sayLang != undefined) {
		url = 'http://tts.voicetech.yandex.net/tts?text='
				+ encodeURIComponent(sentence) + '&lang=' + sayLang
				+ '&format=mp3&quality=hi';
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
	case 'zh': return 'zh'; // Chinese
	}
	return undefined;
};

function baiduSay(sentence, lang, speed) {
	var sayLang = baiduTTSLang(lang);
	if (sayLang != undefined) {
		url = 'http://tts.baidu.com/text2audio?text='
				+ encodeURIComponent(sentence) + '&lan=' + sayLang
				+ '&ie=UTF-8';
		playURL(url);
		return true;
	}
	return false;
}

function googleSay(sentence, lang) {
    // Create Google TTS in a way that it doesn't get tired that quickly.
    var gRand = function() {
        return Math.floor(Math.random() * 1000000) + '|'
                + Math.floor(Math.random() * 1000000)
    };
    url = "http://translate.google.com/translate_tts?ie=UTF-8&tl="
            + lang + "&total=1&textlen=" + sentence.length
            + "&tk=" + gRand() + "&q=" + encodeURIComponent(sentence)
            + "&client=tw-ob";
    playURL(url, lang);
    return true;
}

// List of supported TTS providers
var sayFunc = new Array();
sayFunc['baidu'] = baiduSay;
sayFunc['google'] = googleSay;
sayFunc['yandex'] = yandexSay;
// Say a sentence
function say(sentence, lang) {
	sentence = sentence.replace(/•/g, "");
	console.debug("Clozemaster saying '" + sentence + "' in ", lang);

	if (sentenceGlobal == sentence) return;  // Don't repeat sentences

	sentenceGlobal = sentence;

	var url = "";
	try {
		engine = ttsEngine[lang];
		// console.log("loop " + engine);
		sayFunc[engine](sentence, lang);
	} catch (err) {
		console.log("Unable to speak in " + lang + ' using ' + engine);
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

function onInputChange() {
	input_value = document.getElementsByClassName("input")[0].value;

	if (input_value != "") {
		pre_value = document.getElementsByClassName("pre")[0].innerText;
		post_value = document.getElementsByClassName("post")[0].innerText;
		lang_pair = window.location.pathname.split('/')[2].split('-');
		// console.log("Saying: ", pre_value + input_value + post_value)

		say(pre_value + input_value + post_value, lang3to2[lang_pair[0]]);
	}
}

input_field = document.getElementsByClassName("input")[0];

new MutationObserver(onInputChange).observe(input_field, {
	attributes : true,
	childList : true,
	subtree : true,
	characterData : true
});

settings_window = document.getElementsByClassName("settings modal")[0];

function onSettingsChange(mutations) {
    for (var i = 0; i < mutations.length; ++i) {
        var mutation = mutations[i];
        var target = mutation.target;
        // console.log("Changes " + mutation.attributeName);
        // console.log("Changes " + mutation.oldValue);
        if (target == settings_window && target) {
            // console.log("AAA " + target.style["display"]);
        }
    }
}

new MutationObserver(onSettingsChange).observe(settings_window, {
	attributes : true,
	attributeOldValue: true
});

console.log("Closemaster TTS version " + GM_info.script.version);
