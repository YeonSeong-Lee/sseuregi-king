// components/svg/StepIcons.tsx
// Cute hand-drawn-style step icons, 64x64 viewBox.
// Color via currentColor so parent controls hue; data-active="true" cues per-icon CSS animation.
import type { ReactNode } from 'react';
import type { VisualActionId } from '@/types';

const STROKE = 'currentColor';
const FILL = 'rgb(250 204 21 / 0.15)';
const SOFT = 'rgb(96 165 250 / 0.25)';
const RED = 'rgb(248 113 113 / 0.35)';
const GREEN = 'rgb(34 197 94 / 0.35)';
const GOLD = 'rgb(250 204 21 / 0.55)';

function Empty({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <g style={{ transformOrigin: '22px 36px' }} className={active ? 'animate-pour-out' : ''}>
        <rect x="18" y="14" width="14" height="28" rx="4" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
        <rect x="22" y="10" width="6" height="6" rx="1.5" stroke={STROKE} strokeWidth="2" />
        <circle cx="23" cy="24" r="1" fill={STROKE} />
        <circle cx="27" cy="24" r="1" fill={STROKE} />
        <path d="M22 30 Q25 32 28 30" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <path d="M40 36 Q43 42 41 46" stroke={SOFT} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="45" cy="48" r="2.5" fill={SOFT} />
      <circle cx="50" cy="44" r="1.8" fill={SOFT} />
    </svg>
  );
}

function Rinse({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="22" y="22" width="20" height="28" rx="4" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <path d="M28 30 H36" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <g className={active ? 'animate-water-drops' : ''}>
        <ellipse cx="26" cy="14" rx="2" ry="3" fill={SOFT} />
        <ellipse cx="32" cy="10" rx="2" ry="3" fill={SOFT} />
        <ellipse cx="38" cy="14" rx="2" ry="3" fill={SOFT} />
      </g>
    </svg>
  );
}


function RemoveCap({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="22" y="22" width="16" height="30" rx="4" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <g className={active ? 'animate-float' : ''}>
        <rect x="24" y="10" width="12" height="8" rx="2" stroke={STROKE} strokeWidth="2.5" fill="rgb(248 113 113 / 0.3)" />
      </g>
      <path d="M26 22 H34" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CrushFlat({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-squish' : ''} style={{ transformOrigin: '32px 42px' }}>
        <path
          d="M22 14 L26 20 L22 28 L28 36 L22 44 L42 44 L36 36 L42 28 L36 20 L42 14 Z"
          stroke={STROKE}
          strokeWidth="2.5"
          fill={FILL}
          strokeLinejoin="round"
        />
        <circle cx="28" cy="32" r="1" fill={STROKE} />
        <circle cx="36" cy="32" r="1" fill={STROKE} />
      </g>
    </svg>
  );
}

function Flatten({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-squish' : ''} style={{ transformOrigin: '32px 42px' }}>
        <rect x="14" y="36" width="36" height="14" rx="2" stroke={STROKE} strokeWidth="2.5" fill="rgb(217 119 6 / 0.3)" />
        <path d="M14 42 H50" stroke={STROKE} strokeWidth="1.5" strokeDasharray="2 2" />
      </g>
      <path d="M16 26 L48 26" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <path d="M22 22 L16 26 L22 30" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M42 22 L48 26 L42 30" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}









// ─── New icons (CSV-derived) ─────────────────────────────────────────────

function bottleBody(extra?: ReactNode) {
  return (
    <>
      <rect x="22" y="22" width="20" height="28" rx="4" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <rect x="26" y="14" width="12" height="10" rx="1.5" stroke={STROKE} strokeWidth="2" fill="none" />
      {extra}
    </>
  );
}

function PeelLabel({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      {bottleBody()}
      <g style={{ transformOrigin: '40px 32px' }} className={active ? 'animate-peel' : ''}>
        <path d="M40 28 L52 24 L54 38 L40 36 Z" stroke={STROKE} strokeWidth="2" fill={RED} strokeLinejoin="round" />
        <path d="M43 30 H50 M43 33 H49" stroke={STROKE} strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}


function ShakeOffFood({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''} style={{ transformOrigin: '32px 36px' }}>
        <path d="M16 24 H48 L44 50 H20 Z" stroke={STROKE} strokeWidth="2.5" fill={FILL} strokeLinejoin="round" />
      </g>
      <circle cx="14" cy="18" r="1.5" fill={STROKE} />
      <circle cx="22" cy="12" r="1.5" fill={STROKE} />
      <circle cx="48" cy="14" r="1.5" fill={STROKE} />
      <circle cx="54" cy="22" r="1.5" fill={STROKE} />
      <path d="M10 20 L14 16 M50 12 L46 16" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}



function RemoveTape({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="14" y="22" width="36" height="26" rx="2" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <g style={{ transformOrigin: '32px 22px' }} className={active ? 'animate-peel' : ''}>
        <path d="M14 22 L50 22 L52 14 L12 14 Z" stroke={STROKE} strokeWidth="2" fill={RED} strokeLinejoin="round" />
      </g>
    </svg>
  );
}


function BreakPieces({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-squish' : ''} style={{ transformOrigin: '32px 32px' }}>
        <path d="M14 18 L32 14 L50 20 L48 46 L18 48 Z" stroke={STROKE} strokeWidth="2.5" fill={FILL} strokeLinejoin="round" />
        <path d="M32 14 L28 30 L40 36 L34 48" stroke={STROKE} strokeWidth="1.8" />
        <path d="M14 30 L26 32 M40 24 L50 28 M30 44 L22 48" stroke={STROKE} strokeWidth="1.4" />
      </g>
    </svg>
  );
}

function PutInBag({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path
        d="M22 26 Q22 18 28 18 L40 18 Q46 18 46 26 L48 52 Q48 56 44 56 L20 56 Q16 56 16 52 Z"
        stroke={STROKE}
        strokeWidth="2.5"
        fill="rgb(244 244 245 / 0.45)"
        strokeLinejoin="round"
      />
      <g className={active ? 'animate-drop' : ''}>
        <rect x="26" y="6" width="14" height="10" rx="2" stroke={STROKE} strokeWidth="2" fill={RED} />
        <path d="M33 18 V14 M31 12 L33 14 L35 12" stroke={STROKE} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

function FlattenBox({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-squish' : ''} style={{ transformOrigin: '32px 42px' }}>
        <path d="M12 36 L52 36 L48 50 L16 50 Z" stroke={STROKE} strokeWidth="2.5" fill="rgb(217 119 6 / 0.3)" strokeLinejoin="round" />
        <path d="M16 42 H48 M20 46 H44" stroke={STROKE} strokeWidth="1.2" />
      </g>
      <path d="M32 14 V30" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <path d="M26 24 L32 30 L38 24" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function TieWithString({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="16" y="18" width="32" height="28" rx="2" stroke={STROKE} strokeWidth="2.5" fill="rgb(217 119 6 / 0.3)" />
        <path d="M32 14 V50" stroke={STROKE} strokeWidth="2.5" />
        <path d="M14 32 H50" stroke={STROKE} strokeWidth="2.5" />
        <path d="M28 32 Q32 26 36 32 Q32 38 28 32" stroke={STROKE} strokeWidth="2" fill={GOLD} />
      </g>
    </svg>
  );
}

function RemovePlasticInserts({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="14" y="14" width="30" height="36" rx="2" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <path d="M18 22 H38 M18 28 H38 M18 34 H38" stroke={STROKE} strokeWidth="1.2" />
      <g style={{ transformOrigin: '46px 32px' }} className={active ? 'animate-peel' : ''}>
        <rect x="42" y="22" width="14" height="20" rx="2" stroke={STROKE} strokeWidth="2" fill={SOFT} />
      </g>
    </svg>
  );
}

function StackFlat({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="12" y="42" width="40" height="8" rx="1.5" stroke={STROKE} strokeWidth="2.5" fill="rgb(217 119 6 / 0.25)" />
        <rect x="14" y="32" width="36" height="8" rx="1.5" stroke={STROKE} strokeWidth="2.5" fill="rgb(217 119 6 / 0.35)" />
        <rect x="16" y="22" width="32" height="8" rx="1.5" stroke={STROKE} strokeWidth="2.5" fill="rgb(217 119 6 / 0.45)" />
        <rect x="18" y="12" width="28" height="8" rx="1.5" stroke={STROKE} strokeWidth="2.5" fill="rgb(217 119 6 / 0.55)" />
      </g>
    </svg>
  );
}


function PlaceGently({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="22" y="14" width="20" height="22" rx="3" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      </g>
      <path d="M12 44 Q18 38 26 42 Q32 46 38 42 Q46 38 52 44" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M16 48 V54 M48 48 V54" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="40" r="1" fill={STROKE} />
      <circle cx="38" cy="40" r="1" fill={STROKE} />
    </svg>
  );
}



function PunctureHoleOutdoors({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <circle cx="50" cy="14" r="6" stroke={STROKE} strokeWidth="2" fill={GOLD} />
      <path d="M50 4 V8 M50 20 V24 M40 14 H44 M56 14 H60 M44 8 L42 6 M58 6 L56 8" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="20" y="18" width="20" height="34" rx="3" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <rect x="24" y="10" width="12" height="10" rx="1.5" stroke={STROKE} strokeWidth="2" fill={RED} />
      <g className={active ? 'animate-drop' : ''}>
        <circle cx="30" cy="34" r="2.5" stroke={STROKE} strokeWidth="2" fill="rgb(24 24 27)" />
        <path d="M14 34 L24 34" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
        <path d="M18 30 L14 34 L18 38" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

function PlaceInBin({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M16 28 L48 28 L44 54 H20 Z" stroke={STROKE} strokeWidth="2.5" fill={SOFT} strokeLinejoin="round" />
      <rect x="14" y="22" width="36" height="6" rx="1.5" stroke={STROKE} strokeWidth="2.5" fill={STROKE} />
      <rect x="26" y="18" width="12" height="4" rx="1" stroke={STROKE} strokeWidth="2" />
      <g className={active ? 'animate-drop' : ''}>
        <circle cx="32" cy="12" r="3" stroke={STROKE} strokeWidth="2" fill={RED} />
      </g>
      <path d="M24 36 V48 M32 36 V48 M40 36 V48" stroke={STROKE} strokeWidth="1.2" />
    </svg>
  );
}

function DrainMoisture({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M16 20 L48 20 L44 38 Q32 46 20 38 Z" stroke={STROKE} strokeWidth="2.5" fill={GREEN} strokeLinejoin="round" />
      <circle cx="24" cy="28" r="1.2" fill={STROKE} />
      <circle cx="30" cy="28" r="1.2" fill={STROKE} />
      <circle cx="36" cy="28" r="1.2" fill={STROKE} />
      <circle cx="42" cy="28" r="1.2" fill={STROKE} />
      <g className={active ? 'animate-water-drops' : ''}>
        <ellipse cx="28" cy="50" rx="1.8" ry="3" fill={SOFT} />
        <ellipse cx="36" cy="50" rx="1.8" ry="3" fill={SOFT} />
      </g>
    </svg>
  );
}

function PutInFoodBag({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path
        d="M22 26 Q22 18 28 18 L40 18 Q46 18 46 26 L48 52 Q48 56 44 56 L20 56 Q16 56 16 52 Z"
        stroke={STROKE}
        strokeWidth="2.5"
        fill={GOLD}
        strokeLinejoin="round"
      />
      <g className={active ? 'animate-drop' : ''}>
        <circle cx="32" cy="8" r="4" stroke={STROKE} strokeWidth="2" fill={GREEN} />
        <path d="M32 12 V18" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function WrapInNewspaper({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="12" y="14" width="40" height="36" rx="2" stroke={STROKE} strokeWidth="2.5" fill="rgb(217 119 6 / 0.25)" />
        <path d="M16 22 H38 M16 28 H42 M16 34 H38 M16 40 H42" stroke={STROKE} strokeWidth="1.2" />
        <rect x="24" y="26" width="16" height="16" rx="2" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      </g>
    </svg>
  );
}





function DropInBox({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M14 30 L32 24 L50 30 V50 H14 Z" stroke={STROKE} strokeWidth="2.5" fill={SOFT} strokeLinejoin="round" />
      <path d="M14 30 L32 36 L50 30" stroke={STROKE} strokeWidth="1.8" fill="none" />
      <path d="M32 36 V50" stroke={STROKE} strokeWidth="1.5" strokeDasharray="2 2" />
      <g className={active ? 'animate-drop' : ''}>
        <rect x="26" y="10" width="12" height="8" rx="1" stroke={STROKE} strokeWidth="2" fill={GREEN} />
      </g>
    </svg>
  );
}






function DropInBin({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M16 26 L48 26 L44 52 H20 Z" stroke={STROKE} strokeWidth="2.5" fill={GREEN} strokeLinejoin="round" />
      <rect x="14" y="20" width="36" height="6" rx="1.5" stroke={STROKE} strokeWidth="2.5" fill={STROKE} />
      <path d="M24 34 V48 M32 34 V48 M40 34 V48" stroke={STROKE} strokeWidth="1.2" />
      <g className={active ? 'animate-drop' : ''}>
        <path d="M28 10 L32 6 L36 10 L36 14 H28 Z" stroke={STROKE} strokeWidth="2" fill={FILL} strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function RegisterOnline({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="10" y="14" width="44" height="30" rx="3" stroke={STROKE} strokeWidth="2.5" fill="rgb(24 24 27 / 0.6)" />
        <rect x="14" y="18" width="36" height="22" rx="1.5" stroke={STROKE} strokeWidth="2" fill={SOFT} />
        <path d="M6 50 H58" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 22 H42 M22 28 H42 M22 34 H34" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="40" cy="32" r="4" stroke={STROKE} strokeWidth="2" fill={GREEN} />
        <path d="M37 32 L39 34 L43 30" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

function PayFee({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="10" y="20" width="44" height="28" rx="3" stroke={STROKE} strokeWidth="2.5" fill={GOLD} />
        <path d="M10 28 H54" stroke={STROKE} strokeWidth="2.5" />
        <rect x="14" y="36" width="10" height="6" rx="1" stroke={STROKE} strokeWidth="2" fill="rgb(24 24 27 / 0.4)" />
      </g>
      <text x="42" y="42" textAnchor="middle" fontSize="11" fontWeight="700" fill={STROKE}>₩</text>
    </svg>
  );
}

function AttachStickerAndPlaceOutside({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="22" y="26" width="22" height="22" rx="2" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <g className={active ? 'animate-bob' : ''} style={{ transformOrigin: '32px 22px' }}>
        <rect x="24" y="14" width="16" height="10" rx="1.5" stroke={STROKE} strokeWidth="2.5" fill={GOLD} />
        <path d="M27 19 H37" stroke={STROKE} strokeWidth="1.2" />
      </g>
      <path d="M48 32 L58 32 M54 28 L58 32 L54 36" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}



function Call15990903({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <path
          d="M20 14 Q14 14 14 20 L14 24 Q14 38 26 50 L30 50 Q36 50 36 44 L36 38 L28 36 L24 40 Q18 36 18 30 L22 26 L20 18 Z"
          stroke={STROKE}
          strokeWidth="2.5"
          fill={GREEN}
          strokeLinejoin="round"
        />
      </g>
      <text x="48" y="22" textAnchor="middle" fontSize="9" fontWeight="700" fill={STROKE}>1599</text>
      <text x="48" y="36" textAnchor="middle" fontSize="9" fontWeight="700" fill={STROKE}>0903</text>
    </svg>
  );
}

function SchedulePickup({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="12" y="16" width="40" height="36" rx="3" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
        <rect x="12" y="16" width="40" height="10" rx="3" stroke={STROKE} strokeWidth="2.5" fill={SOFT} />
        <rect x="18" y="10" width="4" height="10" rx="1" stroke={STROKE} strokeWidth="2" fill={STROKE} />
        <rect x="42" y="10" width="4" height="10" rx="1" stroke={STROKE} strokeWidth="2" fill={STROKE} />
        <path d="M20 38 L26 44 L40 30" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}




// ─── New V-ID icons (no existing counterpart) ──────────────────────────

function PopBubbles({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="10" y="14" width="44" height="36" rx="3" stroke={STROKE} strokeWidth="2.5" fill={SOFT} />
      <g className={active ? 'animate-water-drops' : ''}>
        <circle cx="18" cy="22" r="3.5" stroke={STROKE} strokeWidth="2" fill={FILL} />
        <circle cx="30" cy="22" r="3.5" stroke={STROKE} strokeWidth="2" fill={FILL} />
        <circle cx="42" cy="22" r="3.5" stroke={STROKE} strokeWidth="2" fill={FILL} />
        <circle cx="18" cy="34" r="3.5" stroke={STROKE} strokeWidth="2" fill={FILL} />
        <circle cx="30" cy="34" r="2" stroke={STROKE} strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
        <circle cx="42" cy="34" r="3.5" stroke={STROKE} strokeWidth="2" fill={FILL} />
        <circle cx="18" cy="44" r="3.5" stroke={STROKE} strokeWidth="2" fill={FILL} />
        <circle cx="30" cy="44" r="3.5" stroke={STROKE} strokeWidth="2" fill={FILL} />
        <circle cx="42" cy="44" r="3.5" stroke={STROKE} strokeWidth="2" fill={FILL} />
      </g>
    </svg>
  );
}

function WriteWarning({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path
        d="M16 22 Q16 14 22 14 L42 14 Q48 14 48 22 L50 52 Q50 56 46 56 L18 56 Q14 56 14 52 Z"
        stroke={STROKE} strokeWidth="2.5" fill="rgb(244 244 245 / 0.45)" strokeLinejoin="round"
      />
      <g className={active ? 'animate-peel' : ''} style={{ transformOrigin: '40px 30px' }}>
        <path d="M22 32 H40" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 40 H36" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 32 L52 22 L54 24 L42 34 Z" stroke={STROKE} strokeWidth="2" fill={RED} strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function OpenCan({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="16" rx="14" ry="4" stroke={STROKE} strokeWidth="2.5" fill={SOFT} />
      <path d="M18 16 V46 Q18 50 32 50 Q46 50 46 46 V16" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <g className={active ? 'animate-bob' : ''} style={{ transformOrigin: '46px 16px' }}>
        <rect x="44" y="10" width="14" height="6" rx="1" stroke={STROKE} strokeWidth="2" fill={GOLD} />
        <circle cx="44" cy="16" r="2" stroke={STROKE} strokeWidth="2" fill={STROKE} />
      </g>
      <path d="M20 22 H44 M20 28 H44" stroke={STROKE} strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}

function EnsureEmpty({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="22" y="12" width="20" height="40" rx="3" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
        <rect x="26" y="6" width="12" height="8" rx="1.5" stroke={STROKE} strokeWidth="2" fill={RED} />
      </g>
      <path d="M14 18 L18 22 M50 22 L54 18" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <path d="M10 30 L16 32 M48 32 L54 30" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <path d="M14 44 L18 42 M46 42 L50 44" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <text x="32" y="36" textAnchor="middle" fontSize="14" fontWeight="800" fill={STROKE}>0</text>
    </svg>
  );
}

function FactoryReset({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="20" y="8" width="24" height="44" rx="4" stroke={STROKE} strokeWidth="2.5" fill="rgb(24 24 27 / 0.6)" />
      <rect x="23" y="14" width="18" height="28" rx="1.5" stroke={STROKE} strokeWidth="2" fill={SOFT} />
      <circle cx="32" cy="48" r="1.8" stroke={STROKE} strokeWidth="1.5" />
      <g className={active ? 'animate-bob' : ''} style={{ transformOrigin: '32px 28px' }}>
        <path d="M26 24 A6 6 0 1 0 32 18" stroke={STROKE} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M32 14 L32 22 L26 22" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M28 32 H36" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function FoldAndBag({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path
        d="M28 26 Q28 18 34 18 L46 18 Q52 18 52 26 L54 52 Q54 56 50 56 L26 56 Q22 56 22 52 Z"
        stroke={STROKE} strokeWidth="2.5" fill={GREEN} strokeLinejoin="round"
      />
      <g className={active ? 'animate-drop' : ''} style={{ transformOrigin: '16px 18px' }}>
        <rect x="6" y="14" width="20" height="10" rx="1" stroke={STROKE} strokeWidth="2.5" fill="rgb(168 85 247 / 0.3)" />
        <path d="M6 19 H26" stroke={STROKE} strokeWidth="1.2" strokeDasharray="2 2" />
      </g>
    </svg>
  );
}

function SoakOil({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="10" y="22" width="44" height="28" rx="2" stroke={STROKE} strokeWidth="2.5" fill="rgb(217 119 6 / 0.25)" />
      <path d="M14 28 H40 M14 34 H44 M14 40 H38" stroke={STROKE} strokeWidth="1.2" />
      <g style={{ transformOrigin: '24px 12px' }} className={active ? 'animate-pour-out' : ''}>
        <rect x="20" y="4" width="10" height="14" rx="1.5" stroke={STROKE} strokeWidth="2" fill={GOLD} />
      </g>
      <path d="M28 18 Q32 26 30 32" stroke={GOLD} strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="36" r="2.5" fill={GOLD} />
      <circle cx="38" cy="40" r="1.8" fill={GOLD} />
    </svg>
  );
}

function ScoopWax({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M18 26 Q18 22 22 22 L42 22 Q46 22 46 26 L46 52 Q46 56 42 56 L22 56 Q18 56 18 52 Z"
        stroke={STROKE} strokeWidth="2.5" fill={FILL} strokeLinejoin="round" />
      <path d="M22 36 Q32 32 42 36" stroke={STROKE} strokeWidth="2" fill={GOLD} />
      <g className={active ? 'animate-peel' : ''} style={{ transformOrigin: '34px 22px' }}>
        <path d="M34 14 L42 6" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="33" cy="20" rx="4" ry="2" stroke={STROKE} strokeWidth="2" fill={SOFT} />
      </g>
    </svg>
  );
}

function SeparateMaterials({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-peel' : ''} style={{ transformOrigin: '20px 32px' }}>
        <rect x="6" y="20" width="18" height="24" rx="2" stroke={STROKE} strokeWidth="2.5" fill={SOFT} />
        <path d="M10 28 H20 M10 34 H18" stroke={STROKE} strokeWidth="1.2" />
      </g>
      <g className={active ? 'animate-peel' : ''} style={{ transformOrigin: '44px 32px' }}>
        <rect x="40" y="20" width="18" height="24" rx="2" stroke={STROKE} strokeWidth="2.5" fill={RED} />
        <path d="M44 28 H54 M44 34 H52" stroke={STROKE} strokeWidth="1.2" />
      </g>
      <path d="M28 32 H36" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />
      <path d="M24 24 L28 32 L24 40" stroke={STROKE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M40 24 L36 32 L40 40" stroke={STROKE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function PopAndDeflate({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-squish' : ''} style={{ transformOrigin: '32px 36px' }}>
        <rect x="10" y="24" width="44" height="22" rx="6" stroke={STROKE} strokeWidth="2.5" fill={SOFT} />
        <path d="M22 30 H42 M18 36 H46 M22 42 H42" stroke={STROKE} strokeWidth="1.5" strokeDasharray="3 2" />
      </g>
      <path d="M14 14 L20 20 M50 14 L44 20" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <text x="32" y="20" textAnchor="middle" fontSize="14" fontWeight="800" fill={STROKE}>POP</text>
    </svg>
  );
}

function FoldInHalf({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-peel' : ''} style={{ transformOrigin: '32px 32px' }}>
        <path d="M14 22 L50 22 L50 42 Q32 50 14 42 Z" stroke={STROKE} strokeWidth="2.5" fill={FILL} strokeLinejoin="round" />
        <path d="M32 22 V46" stroke={STROKE} strokeWidth="2" strokeDasharray="3 2" />
      </g>
      <path d="M26 14 L32 20 L38 14" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function CutEarLoops({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="32" rx="14" ry="10" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <path d="M18 26 Q10 30 18 38" stroke={STROKE} strokeWidth="2" fill="none" />
      <path d="M46 26 Q54 30 46 38" stroke={STROKE} strokeWidth="2" fill="none" />
      <g className={active ? 'animate-peel' : ''} style={{ transformOrigin: '14px 32px' }}>
        <circle cx="8" cy="28" r="3" stroke={STROKE} strokeWidth="2" fill={RED} />
        <circle cx="8" cy="36" r="3" stroke={STROKE} strokeWidth="2" fill={RED} />
        <path d="M11 30 L18 32 L11 34" stroke={STROKE} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

function RemoveBatteries({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="12" y="20" width="40" height="28" rx="3" stroke={STROKE} strokeWidth="2.5" fill="rgb(24 24 27 / 0.55)" />
      <g className={active ? 'animate-drop' : ''} style={{ transformOrigin: '32px 14px' }}>
        <rect x="20" y="4" width="10" height="14" rx="1" stroke={STROKE} strokeWidth="2" fill={GREEN} />
        <rect x="22" y="2" width="6" height="3" rx="0.5" stroke={STROKE} strokeWidth="1.5" fill={STROKE} />
        <rect x="34" y="4" width="10" height="14" rx="1" stroke={STROKE} strokeWidth="2" fill={GREEN} />
        <rect x="36" y="2" width="6" height="3" rx="0.5" stroke={STROKE} strokeWidth="1.5" fill={STROKE} />
      </g>
      <rect x="18" y="28" width="12" height="14" rx="1" stroke={STROKE} strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
      <rect x="34" y="28" width="12" height="14" rx="1" stroke={STROKE} strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
    </svg>
  );
}

// ─── Registry: VisualActionId → component ──────────────────────────────

const VISUAL_ACTIONS: Record<VisualActionId, (props: { active: boolean }) => ReactNode> = {
  V01: RemoveCap,                  // Remove Cap / Lid / Pump
  V02: PeelLabel,                  // Peel Off Label
  V03: CrushFlat,                  // Crush / Flatten
  V04: Empty,                      // Empty Contents / Pour Out
  V05: Rinse,                      // Rinse With Water
  V06: ShakeOffFood,               // Remove Food Residue / Scrape Clean
  V07: StackFlat,                  // Stack Together
  V08: Flatten,                    // Flatten / Fold Flat
  V09: PlaceInBin,                 // Place In Correct Bin / Bag
  V10: PopBubbles,                 // Pop Bubbles
  V11: BreakPieces,                // Break Into Pieces
  V12: RemoveTape,                 // Remove Tape / Labels / Stickers
  V13: PutInBag,                   // Just Toss It In
  V14: FlattenBox,                 // Flatten Cardboard Box
  V15: TieWithString,              // Tie With String / Stack Neatly
  V16: RemovePlasticInserts,       // Remove Plastic Window
  V17: PlaceGently,                // Place Gently In Glass Bin
  V18: WrapInNewspaper,            // Wrap In Newspaper (Safety)
  V19: WriteWarning,               // Write Warning Label On Bag
  V20: OpenCan,                    // Open Can Fully
  V21: EnsureEmpty,                // Ensure Completely Empty (Pressurized)
  V22: PunctureHoleOutdoors,       // Puncture / Release Gas
  V23: FactoryReset,               // Factory Reset / Wipe Data
  V24: Call15990903,               // Call 1599-0903 / Drop At 주민센터
  V25: DropInBox,                  // Drop At Special Collection Box
  V26: RegisterOnline,             // Register Online At Gangnam-gu
  V27: PayFee,                     // Pay The Fee
  V28: AttachStickerAndPlaceOutside, // Stick Number & Put Outside
  V29: SchedulePickup,             // Schedule Pickup Date
  V30: DrainMoisture,              // Drain All Liquid
  V31: PutInFoodBag,               // Put In Food Waste Bin / Yellow Bag
  V32: FoldAndBag,                 // Put In A Bag / Fold
  V33: DropInBin,                  // Drop In Clothing Donation Bin
  V34: SoakOil,                    // Soak In Newspaper / Paper Towels
  V35: ScoopWax,                   // Scoop Out Wax
  V36: SeparateMaterials,          // Separate Materials / Disassemble
  V37: PopAndDeflate,              // Pop And Deflate
  V38: FoldInHalf,                 // Fold In Half
  V39: CutEarLoops,                // Cut Ear Loops / Strings
  V45: RemoveBatteries,            // Remove Batteries
};

export function StepIcon({ id, active = false }: { id: VisualActionId; active?: boolean }) {
  const Component = VISUAL_ACTIONS[id];
  if (!Component) return null;
  return <Component active={active} />;
}
