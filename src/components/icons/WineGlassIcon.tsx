import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const WineGlassIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 2H16L15 10C15 12.2091 13.6569 14 12 14C10.3431 14 9 12.2091 9 10L8 2Z" />
    <path d="M12 14V20" />
    <path d="M8 20H16" />
    <path d="M9 6H15" />
  </svg>
);

export default WineGlassIcon;
