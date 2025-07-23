"use client";
import { useState } from "react";
import { ChatTextGenerateEffect } from "./chat-text-generate-effect";
import { Button } from "./button";

const sampleResponses = [
  "For wheat cultivation, I recommend using a balanced NPK fertilizer with a ratio of 120:60:40 kg per hectare. Apply 25% nitrogen as basal dose, 50% at tillering stage, and remaining 25% at grain filling stage.",
  
  "To grow healthy tomatoes, ensure well-draining soil with pH 6.0-6.8. Plant seedlings 18-24 inches apart, provide support stakes, and water consistently. Watch for common pests like hornworms and diseases like blight.",
  
  "Rice requires flooded fields during most of its growing season. Maintain 2-5cm water depth during vegetative growth, drain 1-2 weeks before harvest. Use certified seeds and transplant 20-25 day old seedlings."
];

export default function ChatLoadingDemo() {
  const [currentResponse, setCurrentResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);

  const simulateResponse = () => {
    setCurrentResponse("");
    setIsStreaming(true);

    // Simulate getting complete response from backend (like the new approach)
    setTimeout(() => {
      const response = sampleResponses[responseIndex];
      // Send complete response at once - typing effect handled by component
      setCurrentResponse(response);
      setIsStreaming(false);
    }, 2000); // 2 second loading delay to show "thinking" animation
  };

  const nextResponse = () => {
    setResponseIndex((prev) => (prev + 1) % sampleResponses.length);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Improved Chat Loading Demo</h1>
        <p className="text-gray-400">See the new loading animation and faster streaming</p>
      </div>

      <div className="flex gap-4 justify-center">
        <Button onClick={simulateResponse} className="bg-green-500 hover:bg-green-600">
          Start Response
        </Button>
        <Button onClick={nextResponse} variant="outline">
          Next Response ({responseIndex + 1}/{sampleResponses.length})
        </Button>
      </div>

      <div className="bg-[#10141E] p-6 rounded-lg border border-[#2A3143] min-h-[200px]">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div className="flex-1 prose prose-invert max-w-none text-white">
            <ChatTextGenerateEffect
              text={currentResponse}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#1E2735] p-4 rounded-lg">
        <h3 className="font-semibold mb-2">New Approach - Like ChatGPT:</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• ✅ Get complete response during "Thinking..." phase</li>
          <li>• ✅ Then display word-by-word smoothly and fast</li>
          <li>• ✅ Proper line-by-line streaming with natural pauses</li>
          <li>• ✅ Blinking cursor during streaming</li>
          <li>• ✅ No more choppy or inconsistent streaming</li>
          <li>• ✅ Professional ChatGPT-like experience</li>
          <li>• Status: {isStreaming ? "Streaming..." : "Complete"}</li>
        </ul>
      </div>
    </div>
  );
}
