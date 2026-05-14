// components/svg/ItemHeroes.tsx
// Per-item character illustrations, 96x96 viewBox. Each has a smiling face for personality.
import type { ReactNode } from 'react';

const STROKE = '#0f172a';

function Eyes({ cx1, cx2, cy }: { cx1: number; cx2: number; cy: number }) {
  return (
    <>
      <circle cx={cx1} cy={cy} r="1.6" fill={STROKE} />
      <circle cx={cx2} cy={cy} r="1.6" fill={STROKE} />
    </>
  );
}

function Smile({ d }: { d: string }) {
  return <path d={d} stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" fill="none" />;
}

function PlasticBottle() {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <rect x="38" y="20" width="20" height="12" rx="2" fill="#3b82f6" stroke={STROKE} strokeWidth="2" />
      <rect x="36" y="32" width="24" height="56" rx="6" fill="#dbeafe" stroke={STROKE} strokeWidth="2.5" />
      <rect x="34" y="50" width="28" height="14" rx="3" fill="#3b82f6" stroke={STROKE} strokeWidth="2" />
      <Eyes cx1={43} cx2={53} cy={42} />
      <Smile d="M44 46 Q48 49 52 46" />
      <text x="40" y="60" fontSize="6" fill="#fff" fontWeight="700">H2O</text>
    </svg>
  );
}

function Newspaper() {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <rect x="14" y="22" width="68" height="56" rx="3" fill="#fefce8" stroke={STROKE} strokeWidth="2.5" transform="rotate(-3 48 50)" />
      <rect x="18" y="26" width="60" height="48" rx="2" fill="#fde68a" stroke={STROKE} strokeWidth="1.5" transform="rotate(-3 48 50)" />
      <g transform="rotate(-3 48 50)">
        <rect x="22" y="30" width="52" height="8" rx="1" fill={STROKE} />
        <rect x="22" y="42" width="24" height="2.5" fill={STROKE} />
        <rect x="22" y="48" width="20" height="2.5" fill={STROKE} />
        <rect x="22" y="54" width="26" height="2.5" fill={STROKE} />
        <Eyes cx1={56} cx2={66} cy={52} />
        <Smile d="M57 60 Q61 63 65 60" />
      </g>
    </svg>
  );
}

function GlassBottle() {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <rect x="42" y="14" width="12" height="10" rx="1" fill="#14532d" stroke={STROKE} strokeWidth="2" />
      <path
        d="M38 26 L38 38 Q34 42 34 50 L34 82 Q34 86 38 86 L58 86 Q62 86 62 82 L62 50 Q62 42 58 38 L58 26 Z"
        fill="#86efac"
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="36" y="56" width="24" height="16" rx="1" fill="#fef3c7" stroke={STROKE} strokeWidth="1.5" />
      <Eyes cx1={43} cx2={53} cy={62} />
      <Smile d="M44 66 Q48 69 52 66" />
    </svg>
  );
}

function AluminumCan() {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <ellipse cx="48" cy="22" rx="20" ry="5" fill="#94a3b8" stroke={STROKE} strokeWidth="2" />
      <path d="M28 22 L28 80 Q28 84 32 85 L64 85 Q68 84 68 80 L68 22" fill="#e2e8f0" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="32" y="38" width="32" height="22" rx="2" fill="#ef4444" stroke={STROKE} strokeWidth="2" />
      <Eyes cx1={42} cx2={54} cy={48} />
      <Smile d="M44 54 Q48 57 52 54" />
      <ellipse cx="48" cy="22" rx="4" ry="1.5" fill={STROKE} />
    </svg>
  );
}

function FoodWaste() {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <path
        d="M20 50 Q20 38 32 36 Q36 24 48 24 Q60 24 64 36 Q76 38 76 50 L72 80 Q72 84 68 84 L28 84 Q24 84 24 80 Z"
        fill="#fde68a"
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse cx="38" cy="52" rx="5" ry="3" fill="#fb923c" />
      <ellipse cx="56" cy="58" rx="6" ry="3" fill="#22c55e" />
      <ellipse cx="48" cy="68" rx="4" ry="2" fill="#fb923c" />
      <Eyes cx1={42} cx2={54} cy={42} />
      <Smile d="M44 46 Q48 49 52 46" />
    </svg>
  );
}

function Cardboard() {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <path d="M16 32 L48 22 L80 32 L80 76 L48 86 L16 76 Z" fill="#d4a574" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M16 32 L48 42 L80 32" stroke={STROKE} strokeWidth="2" fill="none" />
      <path d="M48 42 V86" stroke={STROKE} strokeWidth="2" />
      <path d="M40 38 L52 32 L56 34 L44 40 Z" fill="#a16207" stroke={STROKE} strokeWidth="1.5" />
      <Eyes cx1={28} cx2={38} cy={58} />
      <Smile d="M28 64 Q33 67 38 64" />
      <Eyes cx1={58} cx2={68} cy={58} />
      <Smile d="M58 64 Q63 67 68 64" />
    </svg>
  );
}

function Styrofoam() {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <path d="M18 32 L78 32 L72 80 Q72 84 68 84 L28 84 Q24 84 24 80 Z" fill="#fff" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="18" y="28" width="60" height="8" rx="3" fill="#f1f5f9" stroke={STROKE} strokeWidth="2" />
      <circle cx="32" cy="50" r="2" fill="#e2e8f0" />
      <circle cx="42" cy="56" r="2" fill="#e2e8f0" />
      <circle cx="60" cy="50" r="2" fill="#e2e8f0" />
      <circle cx="50" cy="68" r="2" fill="#e2e8f0" />
      <circle cx="62" cy="68" r="2" fill="#e2e8f0" />
      <Eyes cx1={40} cx2={54} cy={48} />
      <Smile d="M42 56 Q47 60 52 56" />
    </svg>
  );
}

function PlasticBag() {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <path d="M30 24 Q30 14 38 14 L58 14 Q66 14 66 24" stroke={STROKE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path
        d="M22 30 L74 30 L70 84 Q70 88 66 88 L30 88 Q26 88 26 84 Z"
        fill="#fafafa"
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M30 36 Q40 40 50 36 Q60 40 70 36" stroke={STROKE} strokeWidth="1.5" fill="none" />
      <Eyes cx1={40} cx2={56} cy={56} />
      <Smile d="M42 64 Q48 69 54 64" />
    </svg>
  );
}

function Battery() {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <rect x="24" y="20" width="48" height="10" rx="2" fill="#a3a3a3" stroke={STROKE} strokeWidth="2" />
      <rect x="20" y="30" width="56" height="56" rx="4" fill="#fbbf24" stroke={STROKE} strokeWidth="2.5" />
      <rect x="26" y="44" width="44" height="20" rx="2" fill="#fef3c7" stroke={STROKE} strokeWidth="2" />
      <path d="M40 50 L36 56 H44 L40 62" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x="52" y="60" fontSize="8" fontWeight="700" fill="#ea580c">+</text>
      <Eyes cx1={36} cx2={60} cy={74} />
      <Smile d="M38 78 Q48 84 58 78" />
    </svg>
  );
}

function ElectronicWaste() {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <rect x="22" y="14" width="52" height="76" rx="6" fill="#1f2937" stroke={STROKE} strokeWidth="2.5" />
      <rect x="28" y="22" width="40" height="50" rx="2" fill="#60a5fa" stroke={STROKE} strokeWidth="2" />
      <circle cx="48" cy="80" r="3" fill="#fff" stroke={STROKE} strokeWidth="1.5" />
      <Eyes cx1={40} cx2={56} cy={40} />
      <Smile d="M40 50 Q48 56 56 50" />
      <path d="M44 60 H52" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const HEROES: Record<string, () => ReactNode> = {
  plastic_bottle: PlasticBottle,
  newspaper: Newspaper,
  glass_bottle: GlassBottle,
  aluminum_can: AluminumCan,
  food_waste: FoodWaste,
  cardboard: Cardboard,
  styrofoam: Styrofoam,
  plastic_bag: PlasticBag,
  battery: Battery,
  electronic_waste: ElectronicWaste,
};

export function ItemHero({ id }: { id: string }) {
  const Component = HEROES[id];
  if (!Component) return null;
  return <Component />;
}
