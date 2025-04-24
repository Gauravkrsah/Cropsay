import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Component for animated text with word-by-word typing effect
const AnimatedText = ({ text, isStreaming }: { text: string, isStreaming: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [wordBuffer, setWordBuffer] = useState('');
  const [lastProcessedLength, setLastProcessedLength] = useState(0);
  
  useEffect(() => {
    if (!isStreaming || !text) return;
    
    // Process only the new part of the text
    const newTextPortion = text.slice(lastProcessedLength);
    if (!newTextPortion) return;
    
    // Update the last processed length
    setLastProcessedLength(text.length);
    
    // Add the new text to the word buffer
    const updatedBuffer = wordBuffer + newTextPortion;
    
    // Check if we have complete words (ending with space, period, comma, etc.)
    const wordBreakRegex = /(\s+|[.,!?;:)\]}"'])/;
    const hasWordBreak = wordBreakRegex.test(updatedBuffer);
    
    if (hasWordBreak) {
      // Split by word breaks but keep the delimiters
      const parts = updatedBuffer.split(/((?:\s+|[.,!?;:)\]}"'])+)/);
      
      // Keep the last part (incomplete word) in the buffer
      const lastPart = parts.pop() || '';
      setWordBuffer(lastPart);
      
      // Add the complete words to the displayed text
      const completeText = parts.join('');
      if (completeText) {
        setDisplayedText(prev => prev + completeText);
      }
    } else {
      // No word break yet, keep buffering
      setWordBuffer(updatedBuffer);
    }
  }, [text, isStreaming, wordBuffer, lastProcessedLength]);
  
  // When streaming stops, flush the buffer
  useEffect(() => {
    if (!isStreaming && wordBuffer) {
      setDisplayedText(prev => prev + wordBuffer);
      setWordBuffer('');
    }
  }, [isStreaming, wordBuffer]);
  
  // Render the text with markdown
  return (
    <div ref={containerRef}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-bold my-4 border-b pb-2 border-gray-700" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold my-3 text-green-400" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-md font-bold my-2 text-blue-400" {...props} />,
          ul: ({node, ...props}) => <ul className="my-3 space-y-2" {...props} />,
          ol: ({node, ...props}) => <ol className="my-3 space-y-2 list-decimal pl-6" {...props} />,
          li: ({node, children, ...props}) => {
            if (String(children).includes("Primary Nutrients") || 
                String(children).includes("Recommended Fertilizer") || 
                String(children).includes("Application Timing") ||
                String(children).includes("Optional Add-ons")) {
              return <li className="font-semibold text-green-400 my-3" {...props}>{children}</li>;
            }
            
            return (
              <li className="flex items-start" {...props}>
                <span className="mr-2 mt-1 text-green-400">•</span>
                <span>{children}</span>
              </li>
            );
          },
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
      {wordBuffer && isStreaming && (
        <span className="text-gray-400">{wordBuffer}</span>
      )}
      {isStreaming && (
        <span className="cursor-blink">▋</span>
      )}
    </div>
  );
};

export default AnimatedText;