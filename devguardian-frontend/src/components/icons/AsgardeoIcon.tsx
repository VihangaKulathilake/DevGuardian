import * as React from "react";

export interface AsgardeoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const AsgardeoIcon: React.FC<AsgardeoIconProps> = ({
  className = "h-4.5 w-4.5",
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="50" cy="50" r="48" fill="#FF7300" />
      <path
        d="M22 52 L36 52 L44 32 L56 68 L64 48 L70 52 L78 52"
        stroke="#FFFFFF"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AsgardeoIcon;

