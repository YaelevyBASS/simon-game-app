/**
 * Circular Simon Board Component (Classic Design with SVG)
 * 
 * Authentic circular Simon game with proper pie-slice wedges using SVG paths.
 * Replicates the iconic look of the original 1978 Simon game.
 */

import { useState, useEffect } from 'react';
import type { Color } from '../../shared/types';

// =============================================================================
// TYPES
// =============================================================================

interface CircularSimonBoardProps {
  sequence: Color[];
  round: number;
  isShowingSequence: boolean;
  isInputPhase: boolean;
  playerSequence: Color[];
  canSubmit: boolean;
  lastResult: { isCorrect: boolean; playerName: string } | null;
  onColorClick: (color: Color) => void;
  onSubmit: () => void;
  disabled?: boolean;
  secondsRemaining: number;
  timerColor: 'green' | 'yellow' | 'red';
  isTimerPulsing: boolean;
}

// =============================================================================
// SVG PATH HELPER - Creates pie slice arc path
// =============================================================================

function createWedgePath(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  // Convert angles to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  // Calculate points
  const x1 = centerX + outerRadius * Math.cos(startRad);
  const y1 = centerY + outerRadius * Math.sin(startRad);
  const x2 = centerX + outerRadius * Math.cos(endRad);
  const y2 = centerY + outerRadius * Math.sin(endRad);
  const x3 = centerX + innerRadius * Math.cos(endRad);
  const y3 = centerY + innerRadius * Math.sin(endRad);
  const x4 = centerX + innerRadius * Math.cos(startRad);
  const y4 = centerY + innerRadius * Math.sin(startRad);

  // Large arc flag (0 for arcs less than 180 degrees)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  // Create SVG path
  return `
    M ${x1} ${y1}
    A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
    L ${x3} ${y3}
    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
    Z
  `;
}

// =============================================================================
// WEDGE COMPONENT (SVG Pie Slice)
// =============================================================================

interface WedgeProps {
  color: Color;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
  startAngle: number;
  endAngle: number;
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
}

const ColorWedge: React.FC<WedgeProps> = ({
  color,
  isActive,
  onClick,
  disabled,
  startAngle,
  endAngle,
  centerX,
  centerY,
  innerRadius,
  outerRadius,
}) => {
  const colors: Record<Color, { base: string; light: string }> = {
    green: { base: '#2ecc40', light: '#7dff8a' },
    red: { base: '#ff4136', light: '#ff8580' },
    yellow: { base: '#ffdc00', light: '#fff580' },
    blue: { base: '#0074d9', light: '#7abfff' },
  };

  const wedgeColor = colors[color];
  const fillColor = isActive ? wedgeColor.light : wedgeColor.base;

  const path = createWedgePath(
    centerX,
    centerY,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle
  );

  return (
    <path
      d={path}
      fill={fillColor}
      stroke="#1a1a1a"
      strokeWidth="4"
      onClick={disabled ? undefined : onClick}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'fill 0.15s ease, filter 0.15s ease, transform 0.15s ease',
        filter: isActive ? 'brightness(1.3) drop-shadow(0 0 20px ' + wedgeColor.light + ')' : 'brightness(1)',
        transformOrigin: `${centerX}px ${centerY}px`,
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        opacity: disabled ? 0.7 : 1,
      }}
      role="button"
      aria-label={`${color} button`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
    />
  );
};

// =============================================================================
// CIRCULAR SIMON BOARD COMPONENT
// =============================================================================

export const CircularSimonBoard: React.FC<CircularSimonBoardProps> = ({
  sequence,
  round,
  isShowingSequence,
  isInputPhase,
  playerSequence,
  canSubmit,
  onColorClick,
  onSubmit,
  disabled = false,
  secondsRemaining,
  timerColor,
  isTimerPulsing,
}) => {
  const [activeColor, setActiveColor] = useState<Color | null>(null);

  // SVG dimensions
  const size = 300;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size / 2 - 10; // Leave margin for stroke
  const innerRadius = size * 0.18; // Center hub size
  const gapAngle = 4; // Gap between wedges in degrees

  // Wedge angles (with gaps)
  const wedges: { color: Color; start: number; end: number }[] = [
    { color: 'green', start: 180 + gapAngle / 2, end: 270 - gapAngle / 2 },   // Top Left
    { color: 'red', start: 270 + gapAngle / 2, end: 360 - gapAngle / 2 },      // Top Right
    { color: 'yellow', start: 90 + gapAngle / 2, end: 180 - gapAngle / 2 },    // Bottom Left
    { color: 'blue', start: 0 + gapAngle / 2, end: 90 - gapAngle / 2 },        // Bottom Right
  ];

  // Animate sequence when showing
  useEffect(() => {
    if (!isShowingSequence || sequence.length === 0) {
      setActiveColor(null);
      return;
    }

    const SHOW_DURATION = 700;
    const SHOW_GAP = 300;

    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const showNextColor = () => {
      if (currentIndex >= sequence.length) {
        setActiveColor(null);
        return;
      }

      const color = sequence[currentIndex];
      setActiveColor(color);

      setTimeout(() => {
        setActiveColor(null);
        currentIndex++;
        timeoutId = setTimeout(showNextColor, SHOW_GAP);
      }, SHOW_DURATION);
    };

    showNextColor();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      setActiveColor(null);
    };
  }, [isShowingSequence, sequence]);

  // Handle color button click
  const handleColorClick = (color: Color) => {
    if (disabled || isShowingSequence || !isInputPhase) return;

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 150);
    onColorClick(color);
  };

  // Get color emoji
  const getColorEmoji = (color: Color): string => {
    const emojis: Record<Color, string> = {
      red: '🔴',
      blue: '🔵',
      yellow: '🟡',
      green: '🟢',
    };
    return emojis[color];
  };

  return (
    <div className="game-area flex flex-col items-center gap-3 w-full">
      {/* Round Display */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          Round {round}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300">
          {disabled 
            ? '👻 Spectating...' 
            : isShowingSequence 
              ? `👀 WATCH! (${sequence.length} color${sequence.length > 1 ? 's' : ''})` 
              : isInputPhase
                ? '🎮 Your turn!' 
                : '✅ Ready'}
        </p>
      </div>

      {/* Timer Display */}
      {isInputPhase && secondsRemaining > 0 && (
        <div className="flex flex-col items-center">
          <div 
            className={`
              font-bold transition-all duration-200
              ${secondsRemaining > 10 ? 'text-3xl' : ''}
              ${secondsRemaining > 5 && secondsRemaining <= 10 ? 'text-4xl' : ''}
              ${secondsRemaining <= 5 ? 'text-5xl' : ''}
              ${timerColor === 'green' ? 'text-green-400' : ''}
              ${timerColor === 'yellow' ? 'text-yellow-400' : ''}
              ${timerColor === 'red' ? 'text-red-400' : ''}
              ${isTimerPulsing ? 'animate-pulse' : ''}
            `}
          >
            {secondsRemaining}s
          </div>
        </div>
      )}

      {/* SVG Circular Simon Board */}
      <div className="relative w-full max-w-[min(85vw,320px)] mx-auto">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-auto"
          style={{ touchAction: 'manipulation' }}
        >
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius + 5}
            fill="#1a1a1a"
          />

          {/* Colored wedges */}
          {wedges.map((wedge) => (
            <ColorWedge
              key={wedge.color}
              color={wedge.color}
              isActive={activeColor === wedge.color}
              onClick={() => handleColorClick(wedge.color)}
              disabled={disabled || isShowingSequence || !isInputPhase}
              startAngle={wedge.start}
              endAngle={wedge.end}
              centerX={centerX}
              centerY={centerY}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
            />
          ))}

          {/* Center hub */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius - 2}
            fill="#1a1a1a"
            stroke="#333"
            strokeWidth="3"
          />

          {/* SIMON text */}
          <text
            x={centerX}
            y={centerY + 4}
            textAnchor="middle"
            fill="white"
            fontSize="20"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            letterSpacing="2"
          >
            SIMON
          </text>
        </svg>
      </div>

      {/* Player Sequence Display */}
      {isInputPhase && playerSequence.length > 0 && (
        <div className="bg-gray-700/80 rounded-lg p-2 w-full max-w-[min(85vw,320px)]">
          <div className="flex justify-center items-center gap-1 min-h-[28px]">
            {playerSequence.map((color, i) => (
              <span key={i} className="text-xl">
                {getColorEmoji(color)}
              </span>
            ))}
            <span className="text-gray-400 text-xs ml-2">
              {playerSequence.length}/{sequence.length}
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {isInputPhase && (
        <button
          onClick={() => {
            if (canSubmit && 'vibrate' in navigator) {
              navigator.vibrate(100);
            }
            onSubmit();
          }}
          disabled={!canSubmit}
          style={{ touchAction: 'manipulation' }}
          className={`
            w-full max-w-[min(85vw,320px)] px-6 py-3 rounded-xl font-bold text-base
            min-h-[56px]
            transition-all duration-100
            ${canSubmit 
              ? 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white cursor-pointer shadow-lg active:scale-95' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'}
          `}
        >
          {canSubmit ? '✅ SUBMIT' : `⏳ ${playerSequence.length}/${sequence.length}`}
        </button>
      )}
    </div>
  );
};

export default CircularSimonBoard;
