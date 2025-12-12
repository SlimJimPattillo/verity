export function VerityLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stylized V with upward arrow */}
      <path
        d="M4 8L14 28L16 24L10 12H14L20 12L24 4L20 4L18 8L14 8L12 4L8 4L4 8Z"
        fill="currentColor"
      />
      <path
        d="M18 10L22 18L26 18L30 10L26 6L22 10L18 10Z"
        fill="currentColor"
      />
      <path
        d="M26 4L28 2L30 4L28 8L26 4Z"
        fill="currentColor"
      />
    </svg>
  );
}
