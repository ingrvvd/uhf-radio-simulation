import React, { useState, useRef, useEffect } from 'react';

export default function ChannelDisplay({ channel, onChange }) {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(1);

  const handleStart = (e) => {
    e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setStartValue(channel);
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const diff = startY - clientY;
      const channelDiff = Math.round(diff / 15);
      let newChannel = startValue + channelDiff;
      
      // Wrap around 1-20
      if (newChannel > 20) newChannel = 1;
      if (newChannel < 1) newChannel = 20;
      
      if (newChannel !== channel) {
        onChange(newChannel);
      }
    };

    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, startY, startValue, channel, onChange]);

  return (
    <div className="flex flex-col items-center">
      {/* CHAN label */}
      <span className="text-[11px] text-stone-300 font-medium tracking-widest mb-1">
        CHAN
      </span>
      
      {/* Display window with channel numbers */}
      <div 
        ref={knobRef}
        className="relative cursor-ns-resize select-none"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Display frame */}
        <div className="bg-black border-2 border-stone-500 rounded shadow-inner px-1 py-0.5">
          <div className="flex items-center justify-center space-x-0.5 min-w-8">
            <span className="text-white font-mono text-xl font-bold w-4 text-right">
              {channel < 10 ? '' : Math.floor(channel / 10)}
            </span>
            <span className="text-white font-mono text-xl font-bold w-4 text-left">
              {channel % 10 === 0 ? '0' : channel % 10}
            </span>
          </div>
        </div>
        
        {/* Small knob on right side */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 rounded-full bg-linear-to-br from-stone-500 via-stone-600 to-stone-700 shadow-md border border-stone-400">
            <div className="absolute inset-0.5 rounded-full bg-linear-to-br from-stone-600 to-stone-800">
              {/* Ridges */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-px bg-stone-500/40 left-0 top-1/2"
                  style={{ transform: `rotate(${i * 22.5}deg)` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}