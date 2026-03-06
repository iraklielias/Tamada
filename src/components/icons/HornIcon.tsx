import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const HornIcon: React.FC<IconProps> = ({ size, width, height, ...props }) => {
  const w = width ?? size ?? 24;
  const h = height ?? size ?? 24;
  return (
  <svg
    width={w}
    height={h}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 3C5.3 4 4 6.3 4 9.3C4 13 5.7 16 6.8 18.1C7.6 19.7 8 20.7 8 21.5" />
    <path d="M18 3C18.7 4 20 6.3 20 9.3C20 13 18.3 16 17.2 18.1C16.4 19.7 16 20.7 16 21.5" />
    <path d="M6 3H18" />
    <path d="M8 21.5H16" />
    <ellipse cx="12" cy="3" rx="6" ry="1.6" />
    <path d="M9 7C9.4 7.6 10.3 8.2 12 8.2C13.7 8.2 14.6 7.6 15 7" />
    <circle cx="12" cy="21" r="1" fill="currentColor" />
  </svg>
  );
};

export default HornIcon;
