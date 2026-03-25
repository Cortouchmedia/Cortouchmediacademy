
"use client";

import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const progressColor = progress < 40 ? 'bg-red-500' : progress < 80 ? 'bg-yellow-400' : 'bg-brand-accent';

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${progressColor}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};