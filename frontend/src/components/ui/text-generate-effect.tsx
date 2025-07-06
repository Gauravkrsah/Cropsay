"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  delay = 0.1,
  onComplete,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  delay?: number;
  onComplete?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset when words change
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [words]);

  useEffect(() => {
    if (currentIndex < words.length && !isComplete) {
      const timer = setTimeout(() => {
        setDisplayedText(words.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, delay * 1000); // Convert to milliseconds

      return () => clearTimeout(timer);
    } else if (currentIndex >= words.length && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, words, delay, isComplete, onComplete]);

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <motion.div
          className="dark:text-white text-black text-2xl leading-snug tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            className={cn(
              "inline-block",
              filter && !isComplete && "blur-sm"
            )}
            animate={{
              filter: filter && !isComplete ? "blur(2px)" : "blur(0px)",
            }}
            transition={{ duration: duration }}
          >
            {displayedText}
          </motion.span>
          {!isComplete && (
            <motion.span
              className="inline-block w-0.5 h-6 bg-current ml-1"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
            >
              |
            </motion.span>
          )}
        </motion.div>
      </div>
    </div>
  );
};