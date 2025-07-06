"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const LLMTextGenerateEffect = ({
  text,
  className,
  speed = 30, // Characters per second
  showCursor = true,
  enableMarkdown = false,
  onComplete,
  onProgress,
}: {
  text: string;
  className?: string;
  speed?: number; // Characters per second (default: 30)
  showCursor?: boolean;
  enableMarkdown?: boolean;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate delay based on speed (characters per second)
  const delay = 1000 / speed; // Convert to milliseconds

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length && !isComplete) {
      const timer = setTimeout(() => {
        const nextChar = text[currentIndex];
        setDisplayedText(prev => prev + nextChar);
        setCurrentIndex(prev => prev + 1);
        
        // Call progress callback
        const progress = ((currentIndex + 1) / text.length) * 100;
        onProgress?.(progress);
      }, delay);

      return () => clearTimeout(timer);
    } else if (currentIndex >= text.length && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, delay, isComplete, onComplete, onProgress]);

  const renderContent = () => {
    if (enableMarkdown) {
      return (
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-xl font-bold my-4 border-b pb-2 border-gray-700" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-lg font-bold my-3 text-green-400" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-md font-bold my-2 text-blue-400" {...props} />,
              ul: ({node, ...props}) => <ul className="my-3 space-y-2" {...props} />,
              ol: ({node, ...props}) => <ol className="my-3 space-y-2 list-decimal pl-6" {...props} />,
              li: ({node, children, ...props}) => (
                <li className="flex items-start" {...props}>
                  <span className="mr-2 mt-1 text-green-400">•</span>
                  <span>{children}</span>
                </li>
              ),
              p: ({node, ...props}) => <p className="my-2" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
              code: ({node, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <div className="bg-gray-800 rounded-md my-2 overflow-hidden">
                    <div className="bg-gray-700 px-4 py-1 text-xs font-semibold text-gray-300">{match[1]}</div>
                    <pre className="p-4 overflow-x-auto">
                      <code className="text-sm" {...props}>{children}</code>
                    </pre>
                  </div>
                ) : (
                  <code className="bg-gray-800 px-1 rounded text-sm" {...props}>{children}</code>
                );
              },
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-green-500 pl-4 my-4 italic bg-opacity-20 bg-green-900 py-2 pr-2 rounded-r" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-green-300" {...props} />
            }}
          >
            {displayedText}
          </ReactMarkdown>
        </div>
      );
    }

    return <span>{displayedText}</span>;
  };

  return (
    <div className={cn("", className)}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {renderContent()}
        {showCursor && !isComplete && (
          <motion.span
            className="inline-block w-0.5 h-5 bg-green-500 ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            |
          </motion.span>
        )}
      </motion.div>
    </div>
  );
};

// Preset configurations for different use cases
export const LLMTextPresets = {
  // Very fast typing like ChatGPT
  chatGPT: { speed: 50, showCursor: true },
  
  // Medium speed for comfortable reading
  comfortable: { speed: 25, showCursor: true },
  
  // Slow and dramatic
  dramatic: { speed: 10, showCursor: true },
  
  // Fast without cursor for UI elements
  instant: { speed: 100, showCursor: false },
  
  // Typewriter effect
  typewriter: { speed: 15, showCursor: true },
};
