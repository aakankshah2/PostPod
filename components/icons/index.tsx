type IconProps = {
  size?: number;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
};

function Icon({
  d,
  size = 18,
  stroke = 1.6,
  className,
  style,
}: IconProps & { d: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {d}
    </svg>
  );
}

export const IconMic = (p: IconProps) => (
  <Icon {...p} d={<>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
  </>} />
);

export const IconFile = (p: IconProps) => (
  <Icon {...p} d={<>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </>} />
);

export const IconUpload = (p: IconProps) => (
  <Icon {...p} d={<>
    <path d="M12 15V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
  </>} />
);

export const IconArrow = (p: IconProps) => (
  <Icon {...p} d={<>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </>} />
);

export const IconArrowLeft = (p: IconProps) => (
  <Icon {...p} d={<>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </>} />
);

export const IconCheck = (p: IconProps) => (
  <Icon {...p} d={<path d="m5 12 5 5 9-11" />} />
);

export const IconChevron = (p: IconProps) => (
  <Icon {...p} d={<path d="m6 9 6 6 6-6" />} />
);

export const IconCopy = (p: IconProps) => (
  <Icon {...p} d={<>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>} />
);

export const IconDownload = (p: IconProps) => (
  <Icon {...p} d={<>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </>} />
);

export const IconLock = (p: IconProps) => (
  <Icon {...p} d={<>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </>} />
);

export const IconSparkle = (p: IconProps) => (
  <Icon {...p} d={<>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="m5.6 5.6 2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </>} />
);

export const IconClose = (p: IconProps) => (
  <Icon {...p} d={<>
    <path d="m6 6 12 12" />
    <path d="m18 6-12 12" />
  </>} />
);

export const IconClock = (p: IconProps) => (
  <Icon {...p} d={<>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>} />
);

export const IconQuote = (p: IconProps) => (
  <Icon {...p} d={<>
    <path d="M7 7h4v4H7a2 2 0 0 0-2 2v4" />
    <path d="M15 7h4v4h-4a2 2 0 0 0-2 2v4" />
  </>} />
);

export const IconList = (p: IconProps) => (
  <Icon {...p} d={<>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </>} />
);

export const IconLinkedIn = (p: IconProps) => (
  <Icon {...p} d={<>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 10v7" />
    <circle cx="8" cy="7" r="0.5" />
    <path d="M12 17v-4a2 2 0 0 1 4 0v4" />
    <path d="M12 10v7" />
  </>} />
);

export const IconYouTube = (p: IconProps) => (
  <Icon {...p} d={<>
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="m10 9 5 3-5 3z" fill="currentColor" />
  </>} />
);

export const IconShield = (p: IconProps) => (
  <Icon {...p} d={<path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z" />} />
);
