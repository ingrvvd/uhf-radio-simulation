import React, { useState, useRef, useEffect } from 'react';

export default function FrequencyKnob({ 
  value, 
  onChange, 
  options,
  size = 'large'
}) {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startValue, setStartValue] = useState(0);

  const sizeClasses = {
    medium: 'w-14 h-14',
    large: 'w-[72px] h-[72px]',
    xlarge: 'w-20 h-20'
  };

  const currentIndex = options.indexOf(value);
  const totalOptions = options.length;
  
  const getRotationAngle = () => {
    return (currentIndex / totalOptions) * 360;
  };

  const getAngleFromEvent = (e, rect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };

  const handleStart = (e) => {
    e.preventDefault();
    const rect = knobRef.current.getBoundingClientRect();
    setStartAngle(getAngleFromEvent(e, rect));
    setStartValue(currentIndex);
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      
      const rect = knobRef.current.getBoundingClientRect();
      const currentAngle = getAngleFromEvent(e, rect);
      let angleDiff = currentAngle - startAngle;
      
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      const indexDiff = Math.round(angleDiff / 10);
      let newIndex = (startValue + indexDiff) % totalOptions;
      if (newIndex < 0) newIndex += totalOptions;
      
      if (newIndex !== currentIndex) {
        onChange(options[newIndex]);
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
  }, [isDragging, startAngle, startValue, currentIndex, options, onChange, totalOptions]);

  return (
    <div className="flex flex-col items-center">
      {/* Value display window */}
      <div className="bg-black border border-stone-600 rounded px-2 py-0.5 mb-2 min-w-7 text-center shadow-inner">
        <span className="text-white font-mono text-lg font-bold tracking-tight">
          {value}
        </span>
      </div>
      
      <div
        ref={knobRef}
        className={`${sizeClasses[size]} relative cursor-grab active:cursor-grabbing select-none`}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Outer metallic ring */}
        <div className="absolute inset-0 rounded-full bg-linear-to-b from-stone-400 via-stone-500 to-stone-600 shadow-xl" />
        
        {/* Knob body - dark with ridges */}
        <div 
          className="absolute inset-0.5 rounded-full bg-linear-to-br from-stone-800 via-[#1a1a1a] to-black"
          style={{
            transform: `rotate(${getRotationAngle()}deg)`,
            transition: isDragging ? 'none' : 'transform 0.05s ease-out'
          }}
        >
          {/* Radial ridges */}
          {[...Array(32)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-[1.5px] left-0 top-1/2 origin-center"
              style={{ 
                transform: `rotate(${i * 11.25}deg)`,
                background: 'linear-gradient(90deg, transparent 0%, transparent 15%, rgba(80,80,80,0.4) 20%, rgba(60,60,60,0.2) 50%, rgba(80,80,80,0.4) 80%, transparent 85%, transparent 100%)'
              }}
            />
          ))}
          
          {/* Center depression */}
          <div className="absolute inset-[30%] rounded-full bg-linear-to-br from-stone-900 to-black shadow-inner" />
          
          {/* Indicator notch */}
          <div className="absolute top-[6%] left-1/2 w-1 h-[15%] -translate-x-1/2 bg-stone-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}