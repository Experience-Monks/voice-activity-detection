# voice-activity-detection

## Syntax
```vad(audioContext, stream [, options]);```

**Default options:**
```javascript
{
  fftSize: 1024,
  bufferLen: 1024,
  smoothingTimeConstant: 0.2,
  minCaptureFreq: 85,         // in Hz
  maxCaptureFreq: 255,        // in Hz
  noiseCaptureDuration: 1000, // in ms
  minNoiseLevel: 0.3,         // from 0 to 1
  maxNoiseLevel: 0.7,         // from 0 to 1
  avgNoiseMultiplier: 1.2,
  onVoiceStart: function() {},
  onVoiceStop: function() {},
  onUpdate: function(val) {}
}
```

* ```minCaptureFreq/maxCaptureFreq``` - human voice frequency range
* ```noiseCaptureDuration``` - time for measuring average env. noise before starting voice activity detection
* ```minNoiseLevel/maxNoiseLevel``` - env. noise level normalization range (during ```noiseCaptureDuration```)
* ```avgNoiseMultiplier``` - multiplier for the average env. noise level to set activity/inactivity state toggle

## Usage
See [example code](https://github.com/Jam3/voice-activity-detection/blob/master/test/test.js)

## Test
```npm run test```
