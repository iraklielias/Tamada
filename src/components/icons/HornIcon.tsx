import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Premium Georgian drinking horn (kantsi) logo mark.
 * Crafted with balanced negative space, refined curves,
 * and a subtle wine-drop accent for brand recognition.
 */
const HornIcon: React.FC<IconProps> = ({ size, width, height, className, ...props }) => {
  const w = width ?? size ?? 24;
  const h = height ?? size ?? 24;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Main horn body — elegant curved kantsi silhouette */}
      <path
        d="M14 6C13 6 10.5 6.8 10.5 9.5C10.5 12 11.5 15.5 12.5 19C13.8 23.5 15 28 15.2 31.5C15.3 33.5 15 35.2 14 36.8C13.2 38 12 39 10.5 39.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 6C35 6 37.5 6.8 37.5 9.5C37.5 12 36.5 15.5 35.5 19C34.2 23.5 33 28 32.8 31.5C32.7 33.5 33 35.2 34 36.8C34.8 38 36 39 37.5 39.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Horn rim — the elegant opening */}
      <ellipse
        cx="24"
        cy="6"
        rx="10"
        ry="3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Inner rim highlight for depth */}
      <ellipse
        cx="24"
        cy="6.5"
        rx="7"
        ry="1.8"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />

      {/* Wine surface line inside horn */}
      <path
        d="M18 10.5C19.2 11.2 21.2 11.7 24 11.7C26.8 11.7 28.8 11.2 30 10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Horn base / tip with ornamental ball */}
      <path
        d="M10.5 39.5C10.5 39.5 11.5 41 14 42C16.5 43 19 43.5 24 43.5C29 43.5 31.5 43 34 42C36.5 41 37.5 39.5 37.5 39.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Decorative band — Georgian ornamental ring */}
      <rect
        x="20"
        y="38"
        width="8"
        height="2.5"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.6"
      />

      {/* Central wine drop accent — brand signature */}
      <path
        d="M24 17C24 17 21.5 21 21.5 23.5C21.5 25.5 22.6 27 24 27C25.4 27 26.5 25.5 26.5 23.5C26.5 21 24 17 24 17Z"
        fill="currentColor"
        opacity="0.7"
      />

      {/* Subtle shine on drop */}
      <ellipse
        cx="23"
        cy="22"
        rx="0.8"
        ry="1.2"
        fill="currentColor"
        opacity="0.2"
      />
    </svg>
  );
};

export default HornIcon;
