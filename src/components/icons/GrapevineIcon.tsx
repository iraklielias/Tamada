import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const GrapevineIcon: React.FC<IconProps> = ({ size, width, height, ...props }) => {
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
    <circle cx="10" cy="12" r="2" />
    <circle cx="14" cy="12" r="2" />
    <circle cx="12" cy="16" r="2" />
    <circle cx="8" cy="16" r="2" />
    <circle cx="16" cy="16" r="2" />
    <circle cx="12" cy="20" r="2" />
    <path d="M12 4V9.5" />
    <path d="M12 4C12.8 3.6 15.4 3.3 17.4 5" />
    <path d="M12 5.8C11.2 5.4 8.6 5.1 6.6 6.8" />
  </svg>
  );
};

export default GrapevineIcon;
