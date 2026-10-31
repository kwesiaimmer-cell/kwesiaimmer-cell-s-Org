/**
 * AIMMER HOUSE TYCOON - Mobile Touch Controls & Virtual Joystick
 */

import React, { useRef, useState, useEffect } from 'react';

interface MobileControlsProps {
  onMove: (stick: { x: number; y: number }) => void;
  onRunToggle: (running: boolean) => void;
  onInteract: () => void;
  onDriveToggle: () => void;
  isDriving: boolean;
  canInteract: boolean;
  interactLabel?: string;
  canDrive: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onRunToggle,
  onInteract,
  onDriveToggle,
  isDriving,
  canInteract,
  interactLabel = 'INTERACT',
  canDrive,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 45; // Max joystick thumb travel

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsActive(true);
    updateStick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateStick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsActive(false);
        setKnobPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
        break;
      }
    }
  };

  const updateStick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance <= maxRadius) {
      setKnobPos({ x: deltaX, y: deltaY });
      onMove({ x: deltaX / maxRadius, y: -deltaY / maxRadius });
    } else {
      const clampedX = (deltaX / distance) * maxRadius;
      const clampedY = (deltaY / distance) * maxRadius;
      setKnobPos({ x: clampedX, y: clampedY });
      onMove({ x: clampedX / maxRadius, y: -clampedY / maxRadius });
    }
  };

  const toggleSprint = () => {
    const next = !isRunning;
    setIsRunning(next);
    onRunToggle(next);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none">
      {/* Virtual Analog Joystick (Bottom Left) */}
      <div className="absolute bottom-24 left-6 pointer-events-auto">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className={`w-32 h-32 rounded-full border-2 transition-colors flex items-center justify-center relative touch-none ${
            isActive
              ? 'border-blue-400 bg-blue-950/40 shadow-lg shadow-blue-500/20'
              : 'border-slate-500/60 bg-slate-900/40'
          }`}
        >
          {/* Inner Joystick Center Ring */}
          <div className="w-12 h-12 rounded-full border border-slate-600/50 bg-slate-800/30"></div>

          {/* Draggable Knob */}
          <div
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: isActive ? 'none' : 'transform 0.15s ease-out',
            }}
            className={`w-14 h-14 rounded-full shadow-lg absolute flex items-center justify-center font-bold text-[10px] text-white ${
              isActive
                ? 'bg-gradient-to-tr from-blue-600 to-cyan-400 border-2 border-white'
                : 'bg-slate-700/80 border border-slate-500'
            }`}
          >
            {isDriving ? 'STEER' : 'MOVE'}
          </div>
        </div>
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="absolute bottom-24 right-6 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Drive Car Button */}
        {(canDrive || isDriving) && (
          <button
            onClick={onDriveToggle}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center text-white active:scale-95 transition-transform"
          >
            <span className="text-xl">{isDriving ? '🚶' : '🚗'}</span>
            <span className="text-[10px] font-black">{isDriving ? 'EXIT' : 'DRIVE'}</span>
          </button>
        )}

        {/* Interact / Build Button */}
        {canInteract && !isDriving && (
          <button
            onClick={onInteract}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 border-2 border-emerald-300 shadow-2xl flex flex-col items-center justify-center text-white active:scale-95 transition-transform"
          >
            <span className="text-2xl">🏗️</span>
            <span className="text-[10px] font-black tracking-wider uppercase mt-0.5">{interactLabel}</span>
          </button>
        )}

        {/* Sprint / Run Toggle */}
        {!isDriving && (
          <button
            onClick={toggleSprint}
            className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center active:scale-95 transition-all ${
              isRunning
                ? 'bg-blue-600 border-blue-300 text-white shadow-lg shadow-blue-500/40'
                : 'bg-slate-800/80 border-slate-600 text-slate-300'
            }`}
          >
            <span className="text-lg">⚡</span>
            <span className="text-[9px] font-bold">RUN</span>
          </button>
        )}
      </div>
    </div>
  );
};
