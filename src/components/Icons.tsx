interface IconProps {
  className?: string;
  strokeWidth?: number;
}

function base(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: className ?? "w-5 h-5",
    "aria-hidden": true,
  };
}

export function IconPlay({ className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M7 4.5v15l13-7.5L7 4.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPause({ className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconReset({ className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

export function IconOrbit({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" />
      <circle cx="21" cy="9.5" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTag({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M4 7h16M4 12h10M4 17h13" />
    </svg>
  );
}

export function IconTrail({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M3 17c4-8 9-10 13-9" strokeDasharray="3 3.5" />
      <circle cx="19" cy="9" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconClose({ className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconRuler({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <rect x="2.5" y="9" width="19" height="6" rx="1.5" />
      <path d="M7 9v3M11 9v2.2M15 9v3M19 9v2.2" />
    </svg>
  );
}

export function IconDistance({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M3 12h18" />
      <path d="M7 8l-4 4 4 4M17 8l4 4-4 4" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconClock({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  );
}

export function IconGauge({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M4.5 18.5a9 9 0 1 1 15 0" />
      <path d="M12 13.5 15.5 9" />
      <circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMoon({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M19 13.5A7.5 7.5 0 1 1 10.5 5a6 6 0 0 0 8.5 8.5Z" />
    </svg>
  );
}

export function IconSparkle({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8.5 13.3 11l2.7 1-2.7 1L12 15.5 10.7 13 8 12l2.7-1L12 8.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCursor({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M5 4.5 19 11l-6 1.5L10.5 19 5 4.5Z" />
      <path d="M14.5 14.5 19 19" />
    </svg>
  );
}

export function IconSunMini({ className }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19" />
    </svg>
  );
}

export function IconSpeaker({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M4 9.5v5h3.2L12 18.8V5.2L7.2 9.5H4Z" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.6a7.8 7.8 0 0 1 0 10.8" />
    </svg>
  );
}

export function IconMusic({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M9 18.5V6.2l10-2v11.6" />
      <circle cx="6.5" cy="18.5" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="15.8" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMute({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
      <path d="m16 9.5 5 5M21 9.5l-5 5" />
    </svg>
  );
}

export function IconUfo({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M12 5a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4Z" />
      <path d="M3 12c0-1.7 4-3 9-3s9 1.3 9 3-4 3-9 3-9-1.3-9-3Z" />
      <path d="M9.5 18.5 8.5 21M14.5 18.5l1 2.5M12 19v2.5" />
    </svg>
  );
}

export function IconGamepad({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M7.5 6.5h9a5.5 5.5 0 0 1 5.4 6.6l-.8 4a2.6 2.6 0 0 1-4.6 1.1L14.6 16H9.4l-1.9 2.2a2.6 2.6 0 0 1-4.6-1.1l-.8-4A5.5 5.5 0 0 1 7.5 6.5Z" />
      <path d="M8 10v3M6.5 11.5h3" />
      <circle cx="15.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconScale({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M12 4v16M7 20h10M12 4c-3.5 0-6 1.6-7.5 3.5M12 4c3.5 0 6 1.6 7.5 3.5" />
      <path d="M4.5 7.5 2 13a2.8 2.8 0 0 0 5 0L4.5 7.5ZM19.5 7.5 17 13a2.8 2.8 0 0 0 5 0l-2.5-5.5Z" />
    </svg>
  );
}

export function IconBook({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M12 6.5C10.5 5 8.4 4.5 4 4.5v13c4.4 0 6.5.5 8 2 1.5-1.5 3.6-2 8-2v-13c-4.4 0-6.5.5-8 2Z" />
      <path d="M12 6.5v13" />
    </svg>
  );
}

export function IconStar({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="m12 3.5 2.5 5.2 5.7.7-4.2 4 1.1 5.6L12 16.2 6.9 19l1.1-5.6-4.2-4 5.7-.7L12 3.5Z" />
    </svg>
  );
}

export function IconCheck({ className, strokeWidth = 2.2 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}
