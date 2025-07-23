"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Custom CSS for visible thinking animation
const thinkingStyles = `
  @keyframes thinkingPulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  .thinking-dot {
    animation: thinkingPulse 1.2s ease-in-out infinite;
  }
`;

export const ChatTextGenerateEffect = ({
  text,
  isStreaming,
  isThinking,
}: {
  text: string;
  isStreaming: boolean;
  isThinking?: boolean;
}) => {
  // Render the text with markdown formatting instantly, no animation or cursor
  const renderFormattedContent = (content: string) => {
    if (!content) return null;
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
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // Show thinking indicator when thinking and no content yet
  if (isThinking && !text) {
    return (
      <>
        <style>{thinkingStyles}</style>
        <div className="relative py-3">
          <div className="flex items-center justify-start">
            <div className="flex space-x-2 items-center">
              <div
                className="w-3 h-3 bg-green-400 rounded-full thinking-dot"
                style={{ animationDelay: '0ms' }}
              ></div>
              <div
                className="w-3 h-3 bg-green-400 rounded-full thinking-dot"
                style={{ animationDelay: '0.3s' }}
              ></div>
              <div
                className="w-3 h-3 bg-green-400 rounded-full thinking-dot"
                style={{ animationDelay: '0.6s' }}
              ></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render the streamed content smoothly without blinking
  return (
    <div className="relative">
      <div className="prose prose-invert max-w-none">
        {text && (
          <div className="whitespace-pre-wrap break-words">
            {renderFormattedContent(text)}
          </div>
        )}
      </div>
    </div>
  );
};