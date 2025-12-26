import React, { useState, useRef, useEffect } from 'react';

export default function RotaryKnob({ 
  value, 
  onChange, 
  options, 
  size = 'medium',
  label,
  showValue = true,
  valueDisplay,
  continuous = false,
  className = ''
}) {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startValue, setStartValue] = useState(0);

  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
    xlarge: 'w-24 h-24'
  };

  const currentIndex = options.indexOf(value);
  const totalOptions = options.length;
  
  // Calculate rotation angle based on current value
  const getRotationAngle = () => {
    if (continuous) {
      return (currentIndex / totalOptions) * 360 - 90;
    }
    const anglePerOption = 270 / (totalOptions - 1);
    return -135 + (currentIndex * anglePerOption);
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
      
      // Normalize angle difference
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      const sensitivity = continuous ? 3 : 8;
      const indexDiff = Math.round(angleDiff / sensitivity);
      let newIndex = startValue + indexDiff;
      
      // Clamp or wrap index
      if (continuous) {
        newIndex = ((newIndex % totalOptions) + totalOptions) % totalOptions;
      } else {
        newIndex = Math.max(0, Math.min(totalOptions - 1, newIndex));
      }
      
      if (newIndex !== currentIndex) {
        onChange(options[newIndex]);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

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
  }, [isDragging, startAngle, startValue, currentIndex, options, onChange, totalOptions, continuous]);

  const handleClick = (e) => {
    const rect = knobRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - rect.width / 2;
    
    // Click on right side = increment, left side = decrement
    const direction = clickX > 0 ? 1 : -1;
    let newIndex = currentIndex + direction;
    
    if (continuous) {
      newIndex = ((newIndex % totalOptions) + totalOptions) % totalOptions;
    } else {
      newIndex = Math.max(0, Math.min(totalOptions - 1, newIndex));
    }
    
    onChange(options[newIndex]);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <span className="text-[10px] text-stone-300 font-medium tracking-wider mb-1 uppercase">
          {label}
        </span>
      )}
      
      <div
        ref={knobRef}
        className={`${sizeClasses[size]} relative cursor-grab active:cursor-grabbing select-none`}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onDoubleClick={handleClick}
      >
        {/* Outer ring - metallic edge */}
        <div className="absolute inset-0 rounded-full bg-linear-to-b from-stone-500 via-stone-600 to-stone-700 shadow-lg" />
        
        {/* Knob body */}
        <div 
          className="absolute inset-0.75 rounded-full bg-linear-to-br from-stone-700 via-stone-800 to-stone-900 shadow-inner"
          style={{
            transform: `rotate(${getRotationAngle()}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Ridged texture */}
          <div className="absolute inset-1 rounded-full overflow-hidden">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-stone-600/30 left-0 top-1/2"
                style={{ transform: `rotate(${i * 15}deg)` }}
              />
            ))}
          </div>
          
          {/* Center cap */}
          <div className="absolute inset-[25%] rounded-full bg-linear-to-br from-stone-600 to-stone-800" />
          
          {/* Indicator line */}
          <div className="absolute top-[8%] left-1/2 w-0.75 h-[20%] -translate-x-1/2 bg-stone-300 rounded-full shadow-sm" />
        </div>
      </div>

      {showValue && (
        <div className="mt-1 text-xs text-stone-200 font-mono font-bold">
          {valueDisplay || value}
        </div>
      )}
    </div>
  );
}