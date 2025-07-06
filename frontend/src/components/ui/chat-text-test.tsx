"use client";
import { useState } from "react";
import { ChatTextGenerateEffect } from "./chat-text-generate-effect";
import { Button } from "./button";

const sampleTexts = [
  "Hello! I'm your agricultural AI assistant. How can I help you today?",
  
  `# Rice Growing Guide

Rice is one of the most important staple crops worldwide. Here's a comprehensive guide:

## Soil Requirements
- **pH Level**: 5.5 to 6.5 (slightly acidic)
- **Soil Type**: Clay or clay loam with good water retention
- **Drainage**: Fields should be able to hold water but also drain when needed

## Planting Process
1. **Land Preparation**: Plow and level the field
2. **Seed Selection**: Choose high-quality, disease-resistant varieties
3. **Transplanting**: Plant 20-25 day old seedlings
4. **Spacing**: 20cm x 15cm for optimal growth

## Water Management
- Maintain 2-5cm water depth during vegetative stage
- Drain field 1-2 weeks before harvest
- Alternate wetting and drying can save water

## Fertilizer Application
- **Nitrogen**: 120-150 kg/ha in split doses
- **Phosphorus**: 60 kg/ha as basal dose
- **Potassium**: 40 kg/ha in two splits

This approach will help you achieve optimal rice yields!`,

  "The best time to plant rice is during the monsoon season when there's adequate water supply. Make sure your field is properly leveled and has good drainage systems in place."
];

export default function ChatTextTest() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [key, setKey] = useState(0);

  const startGeneration = () => {
    setKey(prev => prev + 1);
    setIsStreaming(true);
    
    // Simulate streaming completion after the text should be done
    const text = sampleTexts[currentTextIndex];
    const estimatedTime = text.length * 30; // 30ms per character
    
    setTimeout(() => {
      setIsStreaming(false);
    }, estimatedTime + 1000); // Add 1 second buffer
  };

  const nextText = () => {
    setCurrentTextIndex((prev) => (prev + 1) % sampleTexts.length);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Chat Text Generation Test</h1>
        <p className="text-gray-400">Test the character-by-character text generation effect</p>
      </div>

      <div className="flex gap-4 justify-center">
        <Button onClick={startGeneration} className="bg-green-500 hover:bg-green-600">
          Start Generation
        </Button>
        <Button onClick={nextText} variant="outline">
          Next Text ({currentTextIndex + 1}/{sampleTexts.length})
        </Button>
      </div>

      <div className="bg-[#10141E] p-6 rounded-lg border border-[#2A3143] min-h-[400px]">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div className="flex-1 prose prose-invert max-w-none text-white">
            <ChatTextGenerateEffect
              key={key}
              text={sampleTexts[currentTextIndex]}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#1E2735] p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Current Settings:</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Speed: ~33 characters per second (30ms delay)</li>
          <li>• Streaming: {isStreaming ? "Active" : "Inactive"}</li>
          <li>• Text Length: {sampleTexts[currentTextIndex].length} characters</li>
          <li>• Estimated Duration: ~{Math.round(sampleTexts[currentTextIndex].length * 30 / 1000)}s</li>
        </ul>
      </div>
    </div>
  );
}
