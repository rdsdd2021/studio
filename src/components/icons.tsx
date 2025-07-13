import type { SVGProps } from "react";

export function LeadsFlowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="currentColor"
        d="M168 40h-8.83a48.07 48.07 0 0 0-82.34 0H68a12 12 0 0 0-12 12v152a12 12 0 0 0 12 12h100a12 12 0 0 0 12-12V52a12 12 0 0 0-12-12Zm-40 8a36 36 0 1 1-36-36 36 36 0 0 1 36 36Zm28 124H100a6 6 0 0 1-6-6v-16a6 6 0 0 1 6-6h56a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6Zm0-40H100a6 6 0 0 1-6-6V98a6 6 0 0 1 6-6h56a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6Z"
      />
    </svg>
  );
}
