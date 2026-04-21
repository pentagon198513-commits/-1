export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
      aria-hidden
    >
      <rect width="64" height="64" rx="14" fill="rgb(var(--accent))" />
      <rect x="8" y="20" width="48" height="28" rx="4" fill="#F4F4F5" />
      <g fill="#52525B">
        <rect x="12" y="24" width="5" height="5" rx="1" />
        <rect x="19" y="24" width="5" height="5" rx="1" />
        <rect x="26" y="24" width="5" height="5" rx="1" />
        <rect x="33" y="24" width="5" height="5" rx="1" />
        <rect x="40" y="24" width="5" height="5" rx="1" />
        <rect x="47" y="24" width="5" height="5" rx="1" />
        <rect x="12" y="31" width="5" height="5" rx="1" />
        <rect x="19" y="31" width="5" height="5" rx="1" />
        <rect x="26" y="31" width="5" height="5" rx="1" fill="#FBBF24" />
        <rect x="33" y="31" width="5" height="5" rx="1" fill="#FBBF24" />
        <rect x="40" y="31" width="5" height="5" rx="1" />
        <rect x="47" y="31" width="5" height="5" rx="1" />
        <rect x="20" y="38" width="24" height="5" rx="1" />
      </g>
    </svg>
  );
}
