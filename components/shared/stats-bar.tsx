"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Container } from "@/components/ui/container";
import { CountingNumber } from "@/components/ui/counting-number";
import { cn } from "@/lib/utils";

export interface StatsBarItem {
  value: number;
  label: string;
  icon?: string;
  suffix?: string;
  format?: "compact";
}

interface StatsBarProps {
  items: StatsBarItem[];
  overlap?: boolean;
  className?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function StatsBar({ items, overlap = true, className }: StatsBarProps) {
  if (items.length === 0) return null;

  const gridCols = items.length <= 2 ? 'sm:grid-cols-2' : items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4';

  return (
    <div
      className={cn(
        "relative z-30 w-full",
        overlap && "-mb-7 sm:-mb-8 lg:-mb-10",
        className,
      )}
    >
      <div className="w-full border-y border-white/10 bg-[#0b1426]/95 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <Container className="max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className={cn(
              "grid grid-cols-2 divide-white/10 sm:gap-2 sm:gap-x-4 md:divide-x rtl:md:divide-x-reverse",
              gridCols
            )}
          >
            {items.map((item) => (
              <motion.li
                key={item.label}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease },
                  },
                }}
                className="flex items-center justify-center gap-2.5 py-3 sm:gap-3.5 sm:py-3.5 md:gap-4"
              >
                {item.icon && (
                  <Icon
                    icon={item.icon}
                    className="h-7 w-7 shrink-0 text-white/90 sm:h-8 sm:w-8 md:h-9 md:w-9"
                    aria-hidden
                  />
                )}
                <div className="flex min-w-0 flex-col items-start text-start leading-none">
                  <span className="flex items-baseline gap-0.5 font-black text-white text-base sm:text-lg md:text-xl lg:text-2xl">
                    <CountingNumber
                      number={item.value}
                      className="tabular-nums"
                    />
                    {item.suffix && (
                      <span className="text-red-deep">{item.suffix}</span>
                    )}
                  </span>
                  <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px] md:text-[11px] rtl:tracking-normal rtl:normal-case">
                    {item.label}
                  </span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </Container>
      </div>
    </div>
  );
}
