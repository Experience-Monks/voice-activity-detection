'use strict';

var analyserFrequency = require('analyser-frequency-average');

module.exports = function(audioContext, stream, opts) {

  opts = opts || {};

  var defaults = {
    fftSize: 1024,
    bufferLen: 1024,
    smoothingTimeConstant: 0.2,
    minCaptureFreq: 85,         // in Hz
    maxCaptureFreq: 255,        // in Hz
    noiseCaptureDuration: 0,    // in ms
    minNoiseCutoffLevel: 0.4,   // from 0 to 1
    maxNoiseCutoffLevel: 0.7,   // from 0 to 1
    avgNoiceMultiplier: 1.2,
    onVoiceStart: function onVoiceStart() {
      console.log('voice start');
    },
    onVoiceStop: function onVoiceStop() {
      console.log('voice stop');
    },
    onUpdate: function onUpdate(val) {
      console.log('curr val:', val);
    }
  };

  var options = {};
  for (var key in defaults) {
    options[key] = opts.hasOwnProperty(key) ? opts[key] : defaults[key];
  }

  var baseFreq = 0;
  var activityCounter = 0;
  var activityCounterMin = 0;
  var activityCounterMax = 60;
  var activityCounterThresh = 5;

  var envFreqRange = [];
  var isNoiseCapturing = true;
  var prevVadState = undefined;
  var vadState = false;
  var captureTimeout = null;

  var source = audioContext.createMediaStreamSource(stream);
  var analyser = audioContext.createAnalyser();
  analyser.smoothingTimeConstant = options.smoothingTimeConstant;
  analyser.fftSize = options.fftSize;

  var scriptProcessorNode = audioContext.createScriptProcessor(options.bufferLen, 1, 1);
  connect();
  scriptProcessorNode.onaudioprocess = monitor;

  if (isNoiseCapturing) {
    //console.log('start noise capturing');
    captureTimeout = setTimeout(init, options.noiseCaptureDuration);
  }

  function init() {
    //console.log('stop noise capturing');
    isNoiseCapturing = false;

    var averageEnvFreq = (envFreqRange.reduce(function(p, c) {
        return p + c;
      }, 0) / envFreqRange.length) || 0;

    baseFreq = averageEnvFreq * options.avgNoiceMultiplier;
    if (baseFreq < options.minNoiseCutoffLevel) baseFreq = options.minNoiseCutoffLevel;
    if (baseFreq > options.maxNoiseCutoffLevel) baseFreq = options.maxNoiseCutoffLevel;

    //console.log('avg env freq:', averageEnvFreq);
    //console.log('base freq:', baseFreq);
  }

  function connect() {
    source.connect(analyser);
    analyser.connect(scriptProcessorNode);
    scriptProcessorNode.connect(audioContext.destination);
  }

  function disconnect() {
    scriptProcessorNode.disconnect();
  }

  function destroy() {
    captureTimeout && clearTimeout(captureTimeout);
    disconnect();
  }

  function monitor() {
    var frequencies = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencies);

    var average = analyserFrequency(analyser, frequencies, options.minCaptureFreq, options.maxCaptureFreq);
    isNoiseCapturing && envFreqRange.push(average);

    if (average >= baseFreq && activityCounter < activityCounterMax) {
      activityCounter++;
    } else if (average < baseFreq && activityCounter > activityCounterMin) {
      activityCounter--;
    }
    vadState = activityCounter > activityCounterThresh;

    if (prevVadState !== vadState) {
      vadState ? onVoiceStart() : onVoiceStop();
      prevVadState = vadState;
    }

    options.onUpdate(average);
  }

  function onVoiceStart() {
    options.onVoiceStart();
  }

  function onVoiceStop() {
    options.onVoiceStop();
  }

  return {connect: connect, disconnect: disconnect, destroy: destroy};
};