import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const QvevriIcon: React.FC<IconProps> = ({ size, width, height, ...props }) => {
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
    <ellipse cx="12" cy="4" rx="4.2" ry="1.6" />
    <path d="M8 4C7.3 5.4 6 8.7 6 13.2C6 18.2 9 22 12 22C15 22 18 18.2 18 13.2C18 8.7 16.7 5.4 16 4" />
    <path d="M9 8.3H15" />
    <path d="M8.2 12.1C8.6 12.7 9.7 13.3 12 13.3C14.3 13.3 15.4 12.7 15.8 12.1" />
  </svg>
  );
};

export default QvevriIcon;
