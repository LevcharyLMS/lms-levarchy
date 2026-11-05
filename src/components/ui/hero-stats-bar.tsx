"use client";

import React, { useEffect, useState, useRef } from "react";

interface CounterStat {
  label: string;
  rawValue: number;
}

interface StatsData {
  visitors: number;
  instructors: number;
  students: number;
  subjects: number;
}

/**
 * Calculates display value and whether '+' is applicable.
 * Rule:
 * - If value < 10: exact count without '+' (e.g. 6 -> "6", not "6+")
 * - If value >= 10:
 *     Round down to the nearest 0 or 5 unit base:
 *     remainder = value % 5
 *     rounded = value - remainder
 *     if remainder > 0, show rounded with "+" (e.g. 1000232 -> 1000230+, 63 -> 60+, 27 -> 25+)
 *     if remainder === 0, show exact without "+" (e.g. 100 -> "100")
 */
function formatNumberWithBase(val: number): { targetValue: number; hasPlus: boolean } {
  if (val < 10) {
    return { targetValue: val, hasPlus: false };
  }
  const remainder = val % 5;
  if (remainder === 0) {
    return { targetValue: val, hasPlus: false };
  }
  return { targetValue: val - remainder, hasPlus: true };
}

function AnimatedStatCounter({ rawValue }: { rawValue: number }) {
  const { targetValue, hasPlus } = formatNumberWithBase(rawValue);
  const [displayValue, setDisplayValue] = useState(targetValue);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Immediate initial sync
    setDisplayValue(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          startAnimation();
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    const startAnimation = () => {
      let startTime: number | null = null;
      const duration = 1200; // ms

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        // easeOutExpo
        const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(easedProgress * targetValue);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplayValue(targetValue);
        }
      };

      requestAnimationFrame(step);
    };

    return () => observer.disconnect();
  }, [targetValue]);

  return (
    <span ref={ref} className="inline-block tabular-nums font-extrabold tracking-tight">
      {displayValue.toLocaleString()}
      {hasPlus && "+"}
    </span>
  );
}

export function HeroStatsBar({ initialStats }: { initialStats?: StatsData }) {
  const [stats, setStats] = useState<StatsData>(
    initialStats || {
      visitors: 1252,
      instructors: 60,
      students: 100,
      subjects: 6,
    }
  );

  useEffect(() => {
    let isMounted = true;
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && isMounted) {
          setStats(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const items: CounterStat[] = [
    {
      label: "Visitors Reached",
      rawValue: stats.visitors,
    },
    {
      label: "Students Enrolled",
      rawValue: stats.students,
    },
    {
      label: "Qualified Instructors",
      rawValue: stats.instructors,
    },
    {
      label: "Subjects",
      rawValue: stats.subjects,
    },
  ];

  return (
    <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14 mb-4">
      {/* Fixed layout containment with contain-content to completely eliminate flicker */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 py-7 px-4 sm:px-8 contain-content">
        <div className="grid grid-cols-2 md:grid-cols-4 items-center">
          {items.map((stat, idx) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center justify-center text-center px-3 sm:px-5 py-3 ${
                // Vertical separator lines
                idx < items.length - 1 ? "md:border-r md:border-slate-300" : ""
              } ${idx === 0 || idx === 2 ? "border-r border-slate-200 md:border-r-0" : ""}`}
            >
              <div className="h-12 flex items-center justify-center text-3xl sm:text-4xl lg:text-[42px] leading-none text-slate-900">
                <AnimatedStatCounter rawValue={stat.rawValue} />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-2 leading-tight">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
