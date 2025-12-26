import React from 'react';

export default function SquelchToggle({ value, onChange }) {
  return (
    <div className="flex flex-col items-center">
      {/* Labels */}
      <div className="flex justify-between w-16 mb-1">
        <span className="text-[8px] text-stone-300 font-medium">OFF</span>
        <span className="text-[8px] text-stone-300 font-medium">ON</span>
      </div>
      
      {/* Toggle track */}
      <div 
        className="relative w-14 h-4 cursor-pointer"
        onClick={() => onChange(!value)}
      >
        {/* Track background */}
        <div className="absolute inset-0 bg-linear-to-b from-stone-800 to-stone-900 rounded-sm border border-stone-600 shadow-inner" />
        
        {/* Slider */}
        <div 
          className={`absolute top-0.5 bottom-0.5 w-6 rounded-sm transition-all duration-150 ease-out
            bg-linear-to-b from-stone-400 via-stone-500 to-stone-600 shadow-md border border-stone-400
            ${value ? 'right-0.5' : 'left-0.5'}`}
        >
          {/* Ridges on slider */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-0.5 h-2 bg-stone-700/50 rounded-full mx-px" />
            <div className="w-0.5 h-2 bg-stone-700/50 rounded-full mx-px" />
            <div className="w-0.5 h-2 bg-stone-700/50 rounded-full mx-px" />
          </div>
        </div>
      </div>
      
      {/* SQUELCH label */}
      <span className="text-[9px] text-stone-300 font-medium tracking-wider mt-1">SQUELCH</span>
    </div>
  );
}