// components/svg/StepIcons.tsx
// Cute hand-drawn-style step icons, 64x64 viewBox.
// Color via currentColor so parent controls hue; data-active="true" cues per-icon CSS animation.
import type { ReactNode } from 'react';
import type { StepId } from '@/types';

const STROKE = 'currentColor';
const FILL = 'rgb(250 204 21 / 0.15)';
const SOFT = 'rgb(96 165 250 / 0.25)';

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

const ICONS: Record<StepId, (props: { active: boolean }) => ReactNode> = {
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
  bag_special: BagSpecial,
  drop_off_battery: DropOffBattery,
  drop_off_dong_center: DropOffDongCenter,
  request_pickup_ewaste: RequestPickupEwaste,
};

export function StepIcon({ id, active = false }: { id: StepId; active?: boolean }) {
  const Component = ICONS[id];
  if (!Component) return null;
  return <Component active={active} />;
}
