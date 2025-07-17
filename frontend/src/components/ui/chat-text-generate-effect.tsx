"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const ChatTextGenerateEffect = ({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
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

  // Render the streamed content instantly, no animation/cursor
  return (
    <div className="relative">
      {renderFormattedContent(text)}
    </div>
  );
};