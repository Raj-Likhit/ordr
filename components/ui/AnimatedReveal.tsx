"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
}

export function AnimatedReveal({
  children,
  delay = 0,
  direction = "up",
  distance = 30,
  duration = 0.6,
  className,
  ...props
}: AnimatedRevealProps) {
  const getInitialY = () => {
    if (direction === "up") return distance;
    if (direction === "down") return -distance;
    return 0;
  };

  const getInitialX = () => {
    if (direction === "left") return distance;
    if (direction === "right") return -distance;
    return 0;
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: getInitialY(), 
        x: getInitialX() 
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        x: 0 
      }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Custom ease-out
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
