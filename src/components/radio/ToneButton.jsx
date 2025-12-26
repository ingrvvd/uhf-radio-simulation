import React, { useState, useRef, useEffect } from 'react';

export default function ToneButton({ onPress, onRelease, isActive }) {
  const [isPressed, setIsPressed] = useState(false);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  const startTone = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    
    // Create oscillator for 1020 Hz tone
    oscillatorRef.current = ctx.createOscillator();
    gainNodeRef.current = ctx.createGain();
    
    oscillatorRef.current.type = 'sine';
    oscillatorRef.current.frequency.setValueAtTime(1020, ctx.currentTime);
    
    gainNodeRef.current.gain.setValueAtTime(0.3, ctx.currentTime);
    
    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(ctx.destination);
    
    oscillatorRef.current.start();
  };

  const stopTone = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  };

  const handlePress = () => {
    setIsPressed(true);
    if (isActive) startTone();
    onPress?.();
  };

  const handleRelease = () => {
    setIsPressed(false);
    stopTone();
    onRelease?.();
  };

  useEffect(() => {
    return () => {
      stopTone();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <button
        className={`w-7 h-7 rounded-full relative transition-transform duration-75 select-none
          ${isPressed ? 'scale-95' : 'scale-100'}`}
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={handlePress}
        onTouchEnd={handleRelease}
      >
        {/* Outer ring */}
        <div className={`absolute inset-0 rounded-full shadow-md
          ${isPressed 
            ? 'bg-linear-to-b from-stone-600 to-stone-700' 
            : 'bg-linear-to-b from-stone-400 via-stone-500 to-stone-600'}`} 
        />
        
        {/* Button face */}
        <div className={`absolute inset-0.5 rounded-full
          ${isPressed 
            ? 'bg-linear-to-br from-stone-700 to-stone-800' 
            : 'bg-linear-to-br from-stone-500 to-stone-700'}`}>
          {/* Center dot */}
          <div className="absolute inset-[35%] rounded-full bg-linear-to-br from-stone-400 to-stone-600" />
        </div>
      </button>
      
      <span className="text-[9px] text-stone-300 font-medium tracking-wider mt-1">TONE</span>
    </div>
  );
}