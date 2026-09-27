// components/SkeletonText.tsx
export function SkeletonText({ width = 'w-32', height = 'h-4' }) {
  return (
    <span
      className={`inline-block bg-gray-300/40 dark:bg-gray-600/30 rounded animate-pulse ${width} ${height}`}
    />
  );
}
