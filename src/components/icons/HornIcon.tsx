import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const HornIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
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
    {/* ყანწი — Traditional Georgian drinking horn */}
    <path d="M6 3C6 3 4 5 4 9C4 13 6 16 7 18C8 20 8 21 8 21" />
    <path d="M18 3C18 3 20 5 20 9C20 13 18 16 17 18C16 20 16 21 16 21" />
    <path d="M6 3H18" />
    <path d="M8 21H16" />
    <ellipse cx="12" cy="3" rx="6" ry="1.5" />
    <path d="M9 7C9 7 10 8 12 8C14 8 15 7 15 7" />
    <circle cx="12" cy="21" r="1" fill="currentColor" />
  </svg>
);

export default HornIcon;
