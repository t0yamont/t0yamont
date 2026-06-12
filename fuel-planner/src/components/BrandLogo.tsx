import type { FuelBrand } from '../types';

// Monogram badges styled in each brand's palette. We deliberately don't bundle
// the brands' trademarked logo files — these read as a logo system without
// the licensing question.
const MONO: Record<FuelBrand, { text: string; bg: string; fg: string }> = {
  maurten:   { text: 'M',   bg: '#e8e0c0', fg: '#15120b' },
  sis:       { text: 'SiS', bg: '#ff6600', fg: '#ffffff' },
  high5:     { text: 'H5',  bg: '#ff0066', fg: '#ffffff' },
  tailwind:  { text: 'TW',  bg: '#00bfff', fg: '#06222e' },
  veloforte: { text: 'VF',  bg: '#d97706', fg: '#ffffff' },
  precision: { text: 'PF',  bg: '#0ea5e9', fg: '#ffffff' },
  custom:    { text: '⚗',   bg: '#a78bfa', fg: '#ffffff' },
  generic:   { text: 'G',   bg: '#94a3b8', fg: '#0f172a' },
};

interface Props {
  brand: FuelBrand;
  size?: number;
}

export default function BrandLogo({ brand, size = 20 }: Props) {
  const m = MONO[brand] ?? MONO.generic;
  const fontScale = m.text.length >= 3 ? 0.34 : m.text.length === 2 ? 0.44 : 0.56;
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-md font-bold select-none shrink-0"
      style={{
        width: size,
        height: size,
        background: m.bg,
        color: m.fg,
        fontSize: Math.round(size * fontScale),
        fontFamily: 'Barlow Condensed, sans-serif',
        letterSpacing: '-0.02em',
        boxShadow: `0 0 ${Math.round(size / 2)}px ${m.bg}40`,
      }}
    >
      {m.text}
    </span>
  );
}
