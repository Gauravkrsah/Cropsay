"use client";
import { useState } from "react";
import { LLMTextGenerateEffect, LLMTextPresets } from "./llm-text-generate-effect";
import { Button } from "./button";

const sampleTexts = {
  welcome: "Welcome to CropSay AI! I'm your intelligent agricultural assistant, ready to help you with farming questions, crop recommendations, and agricultural best practices.",
  
  fertilizer: `# Fertilizer Recommendation for Wheat

Based on your soil analysis, here's my recommendation:

## Primary Nutrients Needed:
- **Nitrogen (N)**: 120 kg/ha for optimal growth
- **Phosphorus (P)**: 60 kg/ha for root development  
- **Potassium (K)**: 40 kg/ha for disease resistance

## Application Schedule:
1. **Base dose**: Apply 50% nitrogen + full P&K before sowing
2. **First top-dress**: 30% nitrogen at 21 days after sowing
3. **Second top-dress**: Remaining 20% nitrogen at flowering stage

This approach will maximize your wheat yield while maintaining soil health.`,

  pest: "For effective pest control in tomatoes, I recommend an integrated approach combining biological controls like beneficial insects, organic neem oil treatments, and proper crop rotation. Monitor your plants weekly for early detection.",

  short: "Great question! Let me help you with that."
};

export default function LLMTextDemo() {
  const [selectedText, setSelectedText] = useState<keyof typeof sampleTexts>("welcome");
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof LLMTextPresets>("chatGPT");
  const [key, setKey] = useState(0); // Force re-render
  const [progress, setProgress] = useState(0);

  const handleRestart = () => {
    setKey(prev => prev + 1);
    setProgress(0);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">LLM Text Generation Effect</h1>
        <p className="text-gray-400">Experience realistic AI text generation like ChatGPT</p>
      </div>

      {/* Controls */}
      <div className="bg-[#1E2735] p-6 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Sample Text:</label>
          <select 
            value={selectedText} 
            onChange={(e) => setSelectedText(e.target.value as keyof typeof sampleTexts)}
            className="w-full p-2 bg-[#131725] border border-[#2A3143] rounded text-white"
          >
            <option value="welcome">Welcome Message</option>
            <option value="fertilizer">Fertilizer Advice (with Markdown)</option>
            <option value="pest">Pest Control Advice</option>
            <option value="short">Short Response</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Typing Speed:</label>
          <select 
            value={selectedPreset} 
            onChange={(e) => setSelectedPreset(e.target.value as keyof typeof LLMTextPresets)}
            className="w-full p-2 bg-[#131725] border border-[#2A3143] rounded text-white"
          >
            <option value="chatGPT">ChatGPT Speed (50 chars/sec)</option>
            <option value="comfortable">Comfortable (25 chars/sec)</option>
            <option value="dramatic">Dramatic (10 chars/sec)</option>
            <option value="typewriter">Typewriter (15 chars/sec)</option>
            <option value="instant">Instant (100 chars/sec)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <Button onClick={handleRestart} className="bg-green-500 hover:bg-green-600">
            Restart Animation
          </Button>
          <div className="text-sm text-gray-400">
            Progress: {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* Demo Area */}
      <div className="bg-[#10141E] p-6 rounded-lg border border-[#2A3143] min-h-[300px]">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div className="flex-1">
            <LLMTextGenerateEffect
              key={key}
              text={sampleTexts[selectedText]}
              className="text-white"
              enableMarkdown={selectedText === "fertilizer"}
              onProgress={setProgress}
              onComplete={() => console.log("Generation complete!")}
              {...LLMTextPresets[selectedPreset]}
            />
          </div>
        </div>
      </div>

      {/* Integration Example */}
      <div className="bg-[#1E2735] p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">How to use in your ChatPage:</h3>
        <pre className="bg-[#131725] p-4 rounded text-sm overflow-x-auto">
{`// Import the component
import { LLMTextGenerateEffect, LLMTextPresets } from '@/components/ui/llm-text-generate-effect';

// Use in your message rendering
{message.role === 'assistant' && (
  <LLMTextGenerateEffect
    text={message.content}
    enableMarkdown={true}
    onComplete={() => console.log('Message complete')}
    {...LLMTextPresets.chatGPT}
  />
)}`}
        </pre>
      </div>
    </div>
  );
}
