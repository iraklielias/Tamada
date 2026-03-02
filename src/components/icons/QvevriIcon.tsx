import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const QvevriIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
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
    {/* ქვევრი — Traditional Georgian clay wine vessel */}
    <ellipse cx="12" cy="4" rx="4" ry="1.5" />
    <path d="M8 4C8 4 6 8 6 13C6 18 9 22 12 22C15 22 18 18 18 13C18 8 16 4 16 4" />
    <path d="M9 8H15" />
    <path d="M8 12C8 12 9 13 12 13C15 13 16 12 16 12" />
  </svg>
);

export default QvevriIcon;
