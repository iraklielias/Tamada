import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const GrapevineIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
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
    {/* Grape cluster with vine */}
    <circle cx="10" cy="12" r="2" />
    <circle cx="14" cy="12" r="2" />
    <circle cx="12" cy="16" r="2" />
    <circle cx="8" cy="16" r="2" />
    <circle cx="16" cy="16" r="2" />
    <circle cx="12" cy="20" r="2" />
    <path d="M12 4V10" />
    <path d="M12 4C12 4 16 3 18 5" />
    <path d="M12 6C12 6 8 5 6 7" />
  </svg>
);

export default GrapevineIcon;
