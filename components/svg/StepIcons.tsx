// components/svg/StepIcons.tsx
// Cute hand-drawn-style step icons, 64x64 viewBox.
// Color via currentColor so parent controls hue; data-active="true" cues per-icon CSS animation.
import type { ReactNode } from 'react';
import type { ActionStepId } from '@/types';

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

function RemoveLabel({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="20" y="12" width="14" height="36" rx="4" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <rect x="22" y="6" width="10" height="8" rx="1.5" stroke={STROKE} strokeWidth="2" />
      <g style={{ transformOrigin: '34px 26px' }} className={active ? 'animate-peel' : ''}>
        <path d="M34 22 L46 18 L48 32 L34 30 Z" stroke={STROKE} strokeWidth="2" fill="rgb(248 113 113 / 0.3)" strokeLinejoin="round" />
        <path d="M37 25 H44" stroke={STROKE} strokeWidth="1.2" strokeLinecap="round" />
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

function BundleDry({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="14" y="20" width="36" height="24" rx="3" stroke={STROKE} strokeWidth="2.5" fill="rgb(217 119 6 / 0.25)" />
        <path d="M14 28 H50 M14 36 H50" stroke={STROKE} strokeWidth="1.2" />
        <path d="M32 14 V50" stroke={STROKE} strokeWidth="2" strokeDasharray="3 2" />
        <ellipse cx="32" cy="32" rx="4" ry="2.5" stroke={STROKE} strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
}

function RemoveTapeStaples({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="14" y="22" width="36" height="26" rx="2" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <g className={active ? 'animate-peel' : ''} style={{ transformOrigin: '32px 22px' }}>
        <path d="M14 22 L50 22 L52 14 L12 14 Z" stroke={STROKE} strokeWidth="2" fill="rgb(248 113 113 / 0.4)" strokeLinejoin="round" />
        <path d="M18 18 H46" stroke={STROKE} strokeWidth="1.2" strokeDasharray="2 2" />
      </g>
      <circle cx="22" cy="36" r="1.2" fill={STROKE} />
      <circle cx="42" cy="36" r="1.2" fill={STROKE} />
    </svg>
  );
}

function DrainWater({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path
        d="M14 22 L50 22 L46 38 Q32 46 18 38 Z"
        stroke={STROKE}
        strokeWidth="2.5"
        fill={FILL}
        strokeLinejoin="round"
      />
      <circle cx="22" cy="28" r="1.2" fill={STROKE} />
      <circle cx="28" cy="28" r="1.2" fill={STROKE} />
      <circle cx="34" cy="28" r="1.2" fill={STROKE} />
      <circle cx="40" cy="28" r="1.2" fill={STROKE} />
      <circle cx="25" cy="34" r="1.2" fill={STROKE} />
      <circle cx="31" cy="34" r="1.2" fill={STROKE} />
      <circle cx="37" cy="34" r="1.2" fill={STROKE} />
      <g className={active ? 'animate-water-drops' : ''}>
        <ellipse cx="26" cy="48" rx="1.8" ry="3" fill={SOFT} />
        <ellipse cx="32" cy="52" rx="1.8" ry="3" fill={SOFT} />
        <ellipse cx="38" cy="48" rx="1.8" ry="3" fill={SOFT} />
      </g>
    </svg>
  );
}

function BagShape({ color, active, accent }: { color: string; active: boolean; accent?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''} style={{ transformOrigin: '32px 50px' }}>
        <path
          d="M18 22 Q18 14 24 14 L40 14 Q46 14 46 22 L50 52 Q50 56 46 56 L18 56 Q14 56 14 52 Z"
          stroke={STROKE}
          strokeWidth="2.5"
          fill={color}
          strokeLinejoin="round"
        />
        <path d="M22 22 Q22 12 32 12 Q42 12 42 22" stroke={STROKE} strokeWidth="2" fill="none" />
        {accent && <text x="32" y="42" textAnchor="middle" fontSize="14" fontWeight="700" fill={accent}>{accent}</text>}
        <circle cx="26" cy="36" r="1.2" fill={STROKE} />
        <circle cx="38" cy="36" r="1.2" fill={STROKE} />
        <path d="M28 42 Q32 44 36 42" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

function BagTransparent({ active }: { active: boolean }) {
  return <BagShape color="rgb(148 163 184 / 0.15)" active={active} />;
}
function BagFood({ active }: { active: boolean }) {
  return <BagShape color="rgb(250 204 21 / 0.55)" active={active} />;
}
function BagGeneral({ active }: { active: boolean }) {
  return <BagShape color="rgb(244 244 245 / 0.45)" active={active} />;
}
function BagSpecial({ active }: { active: boolean }) {
  return <BagShape color="rgb(120 113 108 / 0.55)" active={active} />;
}

function DropOffBattery({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="12" y="32" width="40" height="20" rx="3" stroke={STROKE} strokeWidth="2.5" fill="rgb(96 165 250 / 0.2)" />
      <g className={active ? 'animate-drop' : ''}>
        <rect x="24" y="14" width="16" height="12" rx="2" stroke={STROKE} strokeWidth="2.5" fill="rgb(34 197 94 / 0.5)" />
        <rect x="28" y="10" width="8" height="4" rx="1" stroke={STROKE} strokeWidth="2" fill={STROKE} />
        <path d="M30 18 H34 M28 22 H36" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <path d="M16 38 H48" stroke={STROKE} strokeWidth="1.2" strokeDasharray="2 2" />
      <circle cx="20" cy="46" r="1.2" fill={STROKE} />
      <circle cx="44" cy="46" r="1.2" fill={STROKE} />
    </svg>
  );
}

function DropOffDongCenter({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <path d="M16 50 V28 L32 14 L48 28 V50 Z" stroke={STROKE} strokeWidth="2.5" fill="rgb(96 165 250 / 0.25)" strokeLinejoin="round" />
        <rect x="28" y="38" width="8" height="12" stroke={STROKE} strokeWidth="2" fill="none" />
        <rect x="22" y="30" width="6" height="6" stroke={STROKE} strokeWidth="1.5" fill="none" />
        <rect x="36" y="30" width="6" height="6" stroke={STROKE} strokeWidth="1.5" fill="none" />
        <circle cx="32" cy="22" r="2" fill={STROKE} />
      </g>
    </svg>
  );
}

function RequestPickupEwaste({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="10" y="32" width="26" height="16" rx="2" stroke={STROKE} strokeWidth="2.5" fill="rgb(96 165 250 / 0.25)" />
        <path d="M36 36 H46 L52 42 V48 H36 Z" stroke={STROKE} strokeWidth="2.5" fill="rgb(96 165 250 / 0.25)" strokeLinejoin="round" />
        <circle cx="20" cy="50" r="3.5" stroke={STROKE} strokeWidth="2" fill="rgb(24 24 27)" />
        <circle cx="44" cy="50" r="3.5" stroke={STROKE} strokeWidth="2" fill="rgb(24 24 27)" />
      </g>
      <rect x="14" y="14" width="14" height="14" rx="2" stroke={STROKE} strokeWidth="2" fill={FILL} />
      <path d="M18 22 H24" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
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

function RemovePump({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="20" y="26" width="20" height="26" rx="3" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <g className={active ? 'animate-float' : ''} style={{ transformOrigin: '30px 16px' }}>
        <rect x="26" y="18" width="10" height="6" rx="1.5" stroke={STROKE} strokeWidth="2" fill={SOFT} />
        <path d="M30 18 V10 H42 V14" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <rect x="40" y="12" width="6" height="4" rx="1" stroke={STROKE} strokeWidth="2" fill={RED} />
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

function WipeClean({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="14" y="28" width="36" height="22" rx="3" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <g className={active ? 'animate-peel' : ''} style={{ transformOrigin: '40px 22px' }}>
        <rect x="34" y="14" width="16" height="12" rx="2" stroke={STROKE} strokeWidth="2.5" fill={SOFT} />
        <path d="M36 18 H48 M36 22 H44" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <path d="M20 36 L26 32 M30 38 L36 34" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BundleTogether({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="14" y="18" width="36" height="28" rx="3" stroke={STROKE} strokeWidth="2.5" fill={SOFT} />
        <path d="M14 32 H50" stroke={STROKE} strokeWidth="1.5" strokeDasharray="3 2" />
        <ellipse cx="32" cy="32" rx="6" ry="3" stroke={STROKE} strokeWidth="2" fill={FILL} />
        <path d="M20 24 H44 M20 40 H44" stroke={STROKE} strokeWidth="1.2" strokeLinecap="round" />
      </g>
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

function RemoveSticker({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="14" y="14" width="36" height="36" rx="3" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <g style={{ transformOrigin: '38px 30px' }} className={active ? 'animate-peel' : ''}>
        <circle cx="34" cy="28" r="9" stroke={STROKE} strokeWidth="2" fill={RED} />
        <path d="M30 28 L33 31 L39 25" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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

function ReturnForDeposit({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="20" y="20" width="14" height="28" rx="3" stroke={STROKE} strokeWidth="2.5" fill={GREEN} />
      <rect x="23" y="12" width="8" height="8" rx="1.5" stroke={STROKE} strokeWidth="2" />
      <g className={active ? 'animate-bob' : ''}>
        <path d="M40 32 H56" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M48 26 L40 32 L48 38" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      <text x="48" y="50" textAnchor="middle" fontSize="11" fontWeight="700" fill={STROKE}>₩</text>
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

function EmptyFood({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g style={{ transformOrigin: '22px 36px' }} className={active ? 'animate-pour-out' : ''}>
        <rect x="18" y="20" width="16" height="22" rx="3" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
        <rect x="22" y="14" width="8" height="8" rx="1" stroke={STROKE} strokeWidth="2" />
      </g>
      <path d="M38 36 Q44 42 42 50" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="44" cy="52" r="2.5" fill={GREEN} />
      <circle cx="50" cy="46" r="1.8" fill={GREEN} />
      <path d="M46 50 L50 46" stroke={STROKE} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function UseUntilEmpty({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="22" y="14" width="20" height="40" rx="3" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <rect x="26" y="6" width="12" height="10" rx="1.5" stroke={STROKE} strokeWidth="2" fill={RED} />
      <g className={active ? 'animate-drop' : ''}>
        <rect x="26" y="42" width="12" height="8" rx="1" fill={SOFT} />
      </g>
      <path d="M26 30 H38 M26 36 H38" stroke={STROKE} strokeWidth="1.2" strokeDasharray="2 2" />
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

function FindCollectionBox({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="12" y="32" width="32" height="20" rx="3" stroke={STROKE} strokeWidth="2.5" fill={SOFT} />
      <path d="M16 38 H40" stroke={STROKE} strokeWidth="1.2" strokeDasharray="2 2" />
      <g className={active ? 'animate-float' : ''}>
        <circle cx="46" cy="20" r="9" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
        <circle cx="46" cy="20" r="3" stroke={STROKE} strokeWidth="2" fill="rgb(24 24 27)" />
        <path d="M52 26 L58 32" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function DropIn({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="14" y="28" width="36" height="24" rx="3" stroke={STROKE} strokeWidth="2.5" fill={SOFT} />
      <path d="M18 34 H46" stroke={STROKE} strokeWidth="1.5" strokeDasharray="3 2" />
      <g className={active ? 'animate-drop' : ''}>
        <circle cx="32" cy="14" r="4" stroke={STROKE} strokeWidth="2" fill={GREEN} />
        <path d="M32 20 V26" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
        <path d="M28 24 L32 28 L36 24" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

function DropInCarefully({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="14" y="32" width="36" height="22" rx="3" stroke={STROKE} strokeWidth="2.5" fill={SOFT} />
      <g className={active ? 'animate-bob' : ''}>
        <ellipse cx="32" cy="18" rx="6" ry="9" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
        <path d="M32 14 H32" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      </g>
      <path d="M44 12 L48 8 M48 16 L44 12 L48 8" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <text x="52" y="14" fontSize="10" fontWeight="700" fill={STROKE}>!</text>
    </svg>
  );
}

function TakeToPharmacy({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="14" y="20" width="36" height="32" rx="3" stroke={STROKE} strokeWidth="2.5" fill={GREEN} />
        <path d="M28 28 H36 V34 H42 V42 H36 V48 H28 V42 H22 V34 H28 Z" stroke={STROKE} strokeWidth="2" fill="rgb(244 244 245 / 0.7)" strokeLinejoin="round" />
        <rect x="22" y="14" width="20" height="8" rx="1.5" stroke={STROKE} strokeWidth="2" fill={FILL} />
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

function CoolDown({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M16 36 H48 L44 54 H20 Z" stroke={STROKE} strokeWidth="2.5" fill={SOFT} strokeLinejoin="round" />
      <path d="M14 30 H50" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <g className={active ? 'animate-water-drops' : ''}>
        <path d="M22 22 Q22 14 26 14 Q30 14 30 22" stroke={STROKE} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M34 26 Q34 18 38 18 Q42 18 42 26" stroke={STROKE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <path d="M14 8 L18 12 M22 8 L18 12 L18 16" stroke={SOFT} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M48 10 L52 14 M56 10 L52 14 L52 18" stroke={SOFT} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function PourInContainer({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g style={{ transformOrigin: '20px 18px' }} className={active ? 'animate-pour-out' : ''}>
        <rect x="10" y="10" width="14" height="20" rx="2" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      </g>
      <path d="M24 30 Q30 34 32 40" stroke={GOLD} strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="28" y="36" width="22" height="20" rx="3" stroke={STROKE} strokeWidth="2.5" fill={GOLD} />
      <rect x="30" y="32" width="18" height="6" rx="1.5" stroke={STROKE} strokeWidth="2" fill="none" />
    </svg>
  );
}

function TakeToCollection({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="14" y="22" width="20" height="20" rx="2" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
        <path d="M18 32 H30" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <path d="M34 32 H50" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 26 L50 32 L44 38" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M50 44 V52 H40" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="46" y="46" width="10" height="10" stroke={STROKE} strokeWidth="2" fill={SOFT} />
    </svg>
  );
}

function CheckWearable({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M16 22 L24 14 L40 14 L48 22 L42 28 L40 24 V50 H24 V24 L22 28 Z" stroke={STROKE} strokeWidth="2.5" fill="rgb(168 85 247 / 0.3)" strokeLinejoin="round" />
      <g className={active ? 'animate-bob' : ''}>
        <circle cx="46" cy="44" r="9" stroke={STROKE} strokeWidth="2.5" fill={GREEN} />
        <path d="M41 44 L45 48 L51 40" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

function FoldNeatly({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-squish' : ''} style={{ transformOrigin: '32px 38px' }}>
        <rect x="14" y="30" width="36" height="16" rx="2" stroke={STROKE} strokeWidth="2.5" fill="rgb(168 85 247 / 0.3)" />
        <path d="M14 38 H50" stroke={STROKE} strokeWidth="1.5" strokeDasharray="3 2" />
      </g>
      <path d="M22 26 L26 22 L40 22 L44 26" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M22 18 L24 16 M42 18 L40 16" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
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

function CheckFreePickup({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g className={active ? 'animate-bob' : ''}>
        <rect x="10" y="20" width="32" height="22" rx="3" stroke={STROKE} strokeWidth="2.5" fill={GREEN} />
        <text x="26" y="36" textAnchor="middle" fontSize="11" fontWeight="800" fill={STROKE}>FREE</text>
      </g>
      <circle cx="48" cy="14" r="8" stroke={STROKE} strokeWidth="2" fill={FILL} />
      <text x="48" y="18" textAnchor="middle" fontSize="10" fontWeight="800" fill={STROKE}>?</text>
    </svg>
  );
}

function AttachSticker({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="14" y="22" width="36" height="28" rx="3" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <g className={active ? 'animate-drop' : ''} style={{ transformOrigin: '32px 28px' }}>
        <rect x="20" y="20" width="24" height="14" rx="1.5" stroke={STROKE} strokeWidth="2.5" fill={GOLD} />
        <path d="M23 26 H41 M23 30 H37" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      </g>
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

function PlaceOutside({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M10 50 H54" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 50 V24 H38 V50" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="rgb(217 119 6 / 0.3)" />
      <rect x="22" y="30" width="12" height="14" rx="1" stroke={STROKE} strokeWidth="2" fill={SOFT} />
      <circle cx="32" cy="38" r="1.5" fill={STROKE} />
      <g className={active ? 'animate-bob' : ''}>
        <rect x="42" y="38" width="14" height="12" rx="1.5" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      </g>
    </svg>
  );
}

function EmptyLiquid({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <g style={{ transformOrigin: '22px 36px' }} className={active ? 'animate-pour-out' : ''}>
        <rect x="18" y="14" width="14" height="28" rx="4" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
        <rect x="22" y="10" width="6" height="6" rx="1.5" stroke={STROKE} strokeWidth="2" />
      </g>
      <path d="M38 32 Q44 38 42 50" stroke={SOFT} strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="44" cy="50" rx="3.5" ry="2" fill={SOFT} />
      <ellipse cx="50" cy="46" rx="2" ry="1.5" fill={SOFT} />
    </svg>
  );
}

function RinseInside({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="20" y="18" width="24" height="32" rx="4" stroke={STROKE} strokeWidth="2.5" fill={FILL} />
      <rect x="26" y="10" width="12" height="10" rx="1.5" stroke={STROKE} strokeWidth="2" fill="none" />
      <g className={active ? 'animate-water-drops' : ''}>
        <path d="M26 36 Q32 30 38 36 Q32 42 26 36 Z" stroke={STROKE} strokeWidth="2" fill={SOFT} />
        <ellipse cx="30" cy="28" rx="1.5" ry="2.5" fill={SOFT} />
        <ellipse cx="34" cy="28" rx="1.5" ry="2.5" fill={SOFT} />
      </g>
    </svg>
  );
}

const ICONS: Record<ActionStepId, (props: { active: boolean }) => ReactNode> = {
  empty: Empty,
  rinse: Rinse,
  remove_label: RemoveLabel,
  remove_cap: RemoveCap,
  crush_flat: CrushFlat,
  flatten: Flatten,
  bundle_dry: BundleDry,
  remove_tape_staples: RemoveTapeStaples,
  drain_water: DrainWater,
  bag_transparent: BagTransparent,
  bag_food_waste: BagFood,
  bag_general: BagGeneral,
  bag_special: BagSpecial,
  drop_off_battery: DropOffBattery,
  drop_off_dong_center: DropOffDongCenter,
  request_pickup_ewaste: RequestPickupEwaste,
  peel_label: PeelLabel,
  remove_pump: RemovePump,
  shake_off_food: ShakeOffFood,
  wipe_clean: WipeClean,
  bundle_together: BundleTogether,
  remove_tape: RemoveTape,
  remove_sticker: RemoveSticker,
  break_pieces: BreakPieces,
  put_in_bag: PutInBag,
  flatten_box: FlattenBox,
  tie_with_string: TieWithString,
  remove_plastic_inserts: RemovePlasticInserts,
  stack_flat: StackFlat,
  return_for_deposit: ReturnForDeposit,
  place_gently: PlaceGently,
  empty_food: EmptyFood,
  use_until_empty: UseUntilEmpty,
  puncture_hole_outdoors: PunctureHoleOutdoors,
  place_in_bin: PlaceInBin,
  drain_moisture: DrainMoisture,
  put_in_food_bag: PutInFoodBag,
  wrap_in_newspaper: WrapInNewspaper,
  find_collection_box: FindCollectionBox,
  drop_in: DropIn,
  drop_in_carefully: DropInCarefully,
  take_to_pharmacy: TakeToPharmacy,
  drop_in_box: DropInBox,
  cool_down: CoolDown,
  pour_in_container: PourInContainer,
  take_to_collection: TakeToCollection,
  check_wearable: CheckWearable,
  fold_neatly: FoldNeatly,
  drop_in_bin: DropInBin,
  register_online: RegisterOnline,
  pay_fee: PayFee,
  attach_sticker_and_place_outside: AttachStickerAndPlaceOutside,
  check_free_pickup: CheckFreePickup,
  attach_sticker: AttachSticker,
  call_1599_0903: Call15990903,
  schedule_pickup: SchedulePickup,
  place_outside: PlaceOutside,
  empty_liquid: EmptyLiquid,
  rinse_inside: RinseInside,
};

export function StepIcon({ id, active = false }: { id: ActionStepId; active?: boolean }) {
  const Component = ICONS[id];
  if (!Component) return null;
  return <Component active={active} />;
}
