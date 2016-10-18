var vad = require('../index.js');
var audioContext;

var valueContainer = document.createElement('div');
document.body.appendChild(valueContainer);

var stateContainer = document.createElement('div');
document.body.appendChild(stateContainer);

requestMic();

function requestMic() {
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia({audio: true}, startUserMedia, handleMicConnectError);
  } catch (e) {
    handleUserMediaError();
  }
}

function handleUserMediaError() {
  console.warn('Mic input is not supported by the browser.');
}

function handleMicConnectError() {
  console.warn('Could not connect microphone. Possible rejected by the user or is blocked by the browser.');
}

function startUserMedia(stream) {
  var options = {
    onVoiceStart: function() {
      console.log('voice start');
      stateContainer.innerHTML = 'Voice state: <strong>active</strong>';
    },
    onVoiceStop: function() {
      console.log('voice stop');
      stateContainer.innerHTML = 'Voice state: <strong>inactive</strong>';
    },
    onUpdate: function(val) {
      //console.log('curr val:', val);
      valueContainer.innerHTML = 'Current voice activity value: <strong>' + val + '</strong>';
    }
  };
  vad(audioContext, stream, options);
}