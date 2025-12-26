import React, { useState, useEffect, useRef } from 'react';
import FrequencyKnob from '../components/radio/FrequencyKnob';
import ChannelDisplay from '../components/radio/ChannelDisplay';
import ModeSelector from '../components/radio/ModeSelector';
import FunctionSelector from '../components/radio/FunctionSelector';
import VolumeKnob from '../components/radio/VolumeKnob';
import SquelchToggle from '../components/radio/SquelchToggle';
import ToneButton from '../components/radio/ToneButton';
import SmallKnob from '../components/radio/SmallKnob';

// Preset channel frequencies
const PRESET_FREQUENCIES = {
  1: { hundreds: '2', units: '5', tenths: '0', hundredths: '00' },
  2: { hundreds: '2', units: '5', tenths: '1', hundredths: '25' },
  3: { hundreds: '2', units: '5', tenths: '5', hundredths: '50' },
  4: { hundreds: '2', units: '6', tenths: '0', hundredths: '00' },
  5: { hundreds: '2', units: '7', tenths: '0', hundredths: '00' },
  6: { hundreds: '2', units: '8', tenths: '0', hundredths: '00' },
  7: { hundreds: '2', units: '9', tenths: '0', hundredths: '00' },
  8: { hundreds: '3', units: '0', tenths: '0', hundredths: '00' },
  9: { hundreds: '3', units: '0', tenths: '5', hundredths: '00' },
  10: { hundreds: '3', units: '1', tenths: '0', hundredths: '00' },
  11: { hundreds: '3', units: '1', tenths: '5', hundredths: '00' },
  12: { hundreds: '3', units: '2', tenths: '0', hundredths: '00' },
  13: { hundreds: '3', units: '2', tenths: '5', hundredths: '00' },
  14: { hundreds: '3', units: '0', tenths: '5', hundredths: '75' },
  15: { hundreds: '3', units: '3', tenths: '5', hundredths: '00' },
  16: { hundreds: '3', units: '4', tenths: '0', hundredths: '00' },
  17: { hundreds: '3', units: '5', tenths: '0', hundredths: '00' },
  18: { hundreds: '3', units: '6', tenths: '0', hundredths: '00' },
  19: { hundreds: '3', units: '7', tenths: '0', hundredths: '00' },
  20: { hundreds: '3', units: '8', tenths: '0', hundredths: '00' },
};

const GUARD_FREQUENCY = { hundreds: '2', units: '4', tenths: '3', hundredths: '00' };

export default function RadioPanel() {
  // Frequency selector knobs
  const [freqHundreds, setFreqHundreds] = useState('3');
  const [freqUnits, setFreqUnits] = useState('0');
  const [freqTenths, setFreqTenths] = useState('5');
  const [freqHundredths, setFreqHundredths] = useState('75');
  
  // Preset channel
  const [presetChannel, setPresetChannel] = useState(14);
  
  // Mode selector
  const [mode, setMode] = useState('MANUAL');
  
  // Function selector
  const [functionMode, setFunctionMode] = useState('OFF');
  
  // Volume and squelch
  const [volume, setVolume] = useState(50);
  const [squelch, setSquelch] = useState(true);
  
  // Tone button state
  //const [toneActive, setToneActive] = useState(false);
  
  // Audio context for static noise
  const audioContextRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Options for frequency knobs
  const hundredsOptions = ['2', '3'];
  const unitsOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const tenthsOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const hundredthsOptions = ['00', '25', '50', '75'];

  // Get current active frequency based on mode
  const getActiveFrequency = () => {
    if (mode === 'GUARD') {
      return GUARD_FREQUENCY;
    } else if (mode === 'PRESET') {
      return PRESET_FREQUENCIES[presetChannel];
    }
    return { hundreds: freqHundreds, units: freqUnits, tenths: freqTenths, hundredths: freqHundredths };
  };

  const activeFreq = getActiveFrequency();
  const displayFrequency = `${activeFreq.hundreds}${activeFreq.units}${activeFreq.tenths}.${activeFreq.hundredths}`;

  // White noise generator
  const createWhiteNoise = (ctx) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    return whiteNoise;
  };

  // Handle power state changes
  useEffect(() => {
    const isOn = functionMode !== 'OFF';
    
    if (isOn && !squelch) {
      // Start static noise when power on and squelch off
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      if (!noiseNodeRef.current) {
        noiseNodeRef.current = createWhiteNoise(ctx);
        gainNodeRef.current = ctx.createGain();
        gainNodeRef.current.gain.setValueAtTime((volume / 100) * 0.15, ctx.currentTime);
        
        noiseNodeRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(ctx.destination);
        noiseNodeRef.current.start();
      }
    } else {
      // Stop static
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    }

    return () => {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
      }
    };
  }, [functionMode, squelch, volume]);

  // Update volume of static
  useEffect(() => {
  if (gainNodeRef.current && audioContextRef.current) {
    gainNodeRef.current.gain.setValueAtTime(
      (volume / 100) * 0.15,
      audioContextRef.current.currentTime
    );
  }
}, [volume]);


  const isRadioOn = functionMode !== 'OFF';

  return (
    <div className="min-h-screen bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center">
        {/* Main radio panel */}
        <div className="relative">
          {/* Panel body - metallic black texture */}
          <div 
            className="relative rounded-lg shadow-2xl border border-stone-700/50"
            style={{
              background: 'linear-gradient(145deg, #1f1f1f 0%, #171717 50%, #0f0f0f 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.8)',
              padding: '20px',
              width: '420px'
            }}
          >
            {/* Metal texture overlay */}
            <div 
              className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* TOP ROW - Channel display and small decorative knobs */}
            <div className="relative flex justify-end items-start mb-4 pr-2">
              <div className="flex items-center gap-3">
                <ChannelDisplay 
                  channel={presetChannel}
                  onChange={setPresetChannel}
                />
                <SmallKnob />
              </div>
            </div>

            {/* MAIN ROW - Frequency selector knobs */}
            <div className="relative flex items-center justify-center gap-1 mb-4">
              <FrequencyKnob 
                value={freqHundreds}
                onChange={setFreqHundreds}
                options={hundredsOptions}
                size="large"
              />
              <FrequencyKnob 
                value={freqUnits}
                onChange={setFreqUnits}
                options={unitsOptions}
                size="large"
              />
              <FrequencyKnob 
                value={freqTenths}
                onChange={setFreqTenths}
                options={tenthsOptions}
                size="large"
              />
              
              {/* Decimal point indicator */}
              <div className="flex flex-col items-center mx-1">
                <div className="w-2 h-2 rounded-full bg-stone-400 mb-2 mt-8" />
              </div>
              
              <FrequencyKnob 
                value={freqHundredths}
                onChange={setFreqHundredths}
                options={hundredthsOptions}
                size="large"
              />
            </div>

            {/* BOTTOM ROW - Controls */}
            <div className="relative flex items-end justify-between mt-2 px-1">
              {/* Left side - Function selector */}
              <div className="flex flex-col items-center">
                <FunctionSelector 
                  value={functionMode}
                  onChange={setFunctionMode}
                />
              </div>

              {/* Center - Tone and Volume */}
              <div className="flex flex-col items-center gap-3">
                <ToneButton
  isActive={isRadioOn}
  onPress={() => {}}
  onRelease={() => {}}
/>

                <VolumeKnob 
                  value={volume}
                  onChange={setVolume}
                  label="VOL"
                />
              </div>

              {/* Right side - Mode selector and Squelch */}
              <div className="flex flex-col items-center gap-3">
                <ModeSelector 
                  value={mode}
                  onChange={setMode}
                  options={['MANUAL', 'PRESET', 'GUARD']}
                  labels={['MANUAL', 'PRESET', 'GUARD']}
                />
                <SquelchToggle 
                  value={squelch}
                  onChange={setSquelch}
                />
              </div>
            </div>

            {/* Corner screws/rivets decoration */}
            <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-linear-to-br from-stone-600 to-stone-800 shadow-inner" />
            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-linear-to-br from-stone-600 to-stone-800 shadow-inner" />
            <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-linear-to-br from-stone-600 to-stone-800 shadow-inner" />
            <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-linear-to-br from-stone-600 to-stone-800 shadow-inner" />
          </div>
        </div>

        {/* Status display */}
        <div className="mt-8 bg-black/50 backdrop-blur rounded-lg px-6 py-4 border border-stone-700/50">
          <div className="text-center">
            <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Active Frequency</div>
            <div className={`font-mono text-3xl font-bold tracking-wider ${isRadioOn ? 'text-green-400' : 'text-stone-600'}`}>
              {displayFrequency} MHz
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs">
              <span className={`px-2 py-1 rounded ${isRadioOn ? 'bg-green-900/50 text-green-400' : 'bg-stone-800 text-stone-500'}`}>
                {functionMode}
              </span>
              <span className={`px-2 py-1 rounded ${mode === 'GUARD' ? 'bg-red-900/50 text-red-400' : 'bg-stone-800 text-stone-400'}`}>
                {mode}
              </span>
              <span className={`px-2 py-1 rounded ${squelch ? 'bg-blue-900/50 text-blue-400' : 'bg-orange-900/50 text-orange-400'}`}>
                SQL {squelch ? 'ON' : 'OFF'}
              </span>
            </div>
            {mode === 'PRESET' && (
              <div className="text-xs text-stone-500 mt-2">
                Preset Channel: {presetChannel}
              </div>
            )}
            {mode === 'GUARD' && (
              <div className="text-xs text-red-400 mt-2 animate-pulse">
                ⚠ GUARD FREQUENCY - 243.000 MHz
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-stone-500 text-xs max-w-md">
          <p className="mb-1">Drag knobs to adjust • Click Tone button to transmit 1020 Hz tone</p>
          <p>MANUAL: Use frequency knobs • PRESET: Use channel selector • GUARD: Emergency 243.0 MHz</p>
        </div>
      </div>
    </div>
  );
}