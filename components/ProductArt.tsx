const INK = "#1f1a17";
const PAPER = "#fbf8f3";

function Shape({ kind, color }: { kind: string; color: string }) {
  switch (kind) {
    case "tin":
      return (
        <>
          <rect x="62" y="62" width="76" height="96" rx="8" fill={color} />
          <rect x="56" y="48" width="88" height="22" rx="7" fill={INK} />
          <rect x="74" y="92" width="52" height="38" rx="4" fill={PAPER} />
          <path d="M100 100c-8 6-8 16 0 22 8-6 8-16 0-22z" fill={color} />
        </>
      );
    case "dripper":
      return (
        <>
          <path d="M52 58h96l-30 50H82z" fill={color} />
          <rect x="70" y="108" width="60" height="8" rx="4" fill={INK} />
          <path d="M148 66c16 0 16 26-12 26" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
          <path d="M74 124h52l8 30a8 8 0 0 1-8 10H74a8 8 0 0 1-8-10z" fill={PAPER} stroke={INK} strokeWidth="4" />
          <path d="M71 146h58l3 10a6 6 0 0 1-6 6H74a6 6 0 0 1-6-6z" fill={INK} opacity=".8" />
        </>
      );
    case "kettle":
      return (
        <>
          <path d="M70 84h60l10 66a8 8 0 0 1-8 10H68a8 8 0 0 1-8-10z" fill={color} />
          <rect x="78" y="72" width="44" height="14" rx="5" fill={INK} />
          <circle cx="100" cy="68" r="6" fill={INK} />
          <path d="M64 140c-22-4-30-28-24-52 2-8 8-14 14-16" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
          <path d="M134 92c20-2 30 14 26 40-2 12-12 22-24 22" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
        </>
      );
    case "grinder":
      return (
        <>
          <rect x="72" y="70" width="56" height="92" rx="12" fill={color} />
          <rect x="72" y="104" width="56" height="8" fill={INK} opacity=".35" />
          <rect x="94" y="52" width="12" height="20" fill={INK} />
          <path d="M100 52h44" stroke={INK} strokeWidth="8" strokeLinecap="round" />
          <circle cx="146" cy="44" r="10" fill={color} stroke={INK} strokeWidth="4" />
        </>
      );
    case "cup":
      return (
        <>
          <path d="M56 86h78v34a36 36 0 0 1-36 36h-6a36 36 0 0 1-36-36z" fill={color} />
          <path d="M134 96c22-4 26 30-4 32" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" />
          <rect x="46" y="160" width="100" height="8" rx="4" fill={INK} />
          <path d="M80 70c-8-10 8-14 0-26M104 70c-8-10 8-14 0-26" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" opacity=".5" />
        </>
      );
    default:
      return (
        <>
          <path d="M62 62h76l8 92a8 8 0 0 1-8 8H62a8 8 0 0 1-8-8z" fill={color} />
          <path d="M60 44h80l-2 20H62z" fill={INK} />
          <rect x="74" y="92" width="52" height="42" rx="4" fill={PAPER} />
          <ellipse cx="100" cy="113" rx="9" ry="13" fill={color} transform="rotate(28 100 113)" />
          <path d="M96 102c6 6 2 16 8 22" fill="none" stroke={PAPER} strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
  }
}

type Props = {
  art: string;
  color: string;
  imageUrl?: string | null;
  name: string;
  className?: string;
};

// Фото товара, а если его нет — иллюстрация в цвете товара.
export function ProductArt({ art, color, imageUrl, name, className = "" }: Props) {
  return (
    <div
      className={`aspect-square overflow-hidden rounded-2xl ${className}`}
      style={{ background: `color-mix(in srgb, ${color} 16%, ${PAPER})` }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <svg viewBox="0 0 200 200" role="img" aria-label={name} className="h-full w-full">
          <Shape kind={art} color={color} />
        </svg>
      )}
    </div>
  );
}
