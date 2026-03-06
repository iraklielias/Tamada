import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const WineGlassIcon: React.FC<IconProps> = ({ size, width, height, ...props }) => {
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
    <path d="M8 2H16L15 9.8C15 12.2 13.6 14 12 14C10.4 14 9 12.2 9 9.8L8 2Z" />
    <path d="M12 14V20" />
    <path d="M8 20H16" />
    <path d="M9 6H15" />
  </svg>
  );
};

export default WineGlassIcon;
