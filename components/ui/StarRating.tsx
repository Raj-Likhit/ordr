import React from "react";

export interface StarRatingProps {
  rating: number;
  count?: number;
  className?: string;
}

export function StarRating({ rating, count, className = "" }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const partialFill = rating % 1;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex text-[var(--color-warning)]">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} fill="currentColor" />
        ))}
        {partialFill > 0 && (
          <StarIcon fill={`url(#partialFill)`} partialFill={partialFill} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} fill="none" stroke="currentColor" />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-[var(--text-small)] text-[var(--color-text-secondary)]">
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}

function StarIcon({ fill, stroke = "none", partialFill }: { fill: string; stroke?: string; partialFill?: number }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke !== "none" ? "2" : "0"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {partialFill !== undefined && (
        <defs>
          <linearGradient id="partialFill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset={`${partialFill * 100}%`} stopColor="currentColor" />
            <stop offset={`${partialFill * 100}%`} stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
