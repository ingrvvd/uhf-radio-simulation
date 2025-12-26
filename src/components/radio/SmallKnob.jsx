import React from 'react';

export default function SmallKnob({ className = '' }) {
  return (
    <div className={`w-4 h-4 rounded-full relative ${className}`}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-linear-to-b from-stone-500 to-stone-700 shadow-sm" />
      
      {/* Knob body */}
      <div className="absolute inset-0.5 rounded-full bg-linear-to-br from-stone-600 to-stone-800">
        {/* Center */}
        <div className="absolute inset-[30%] rounded-full bg-linear-to-br from-stone-500 to-stone-700" />
      </div>
    </div>
  );
}