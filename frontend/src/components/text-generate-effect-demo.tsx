"use client";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

const words = `Hello! I'm your agricultural AI assistant. I can help you with crop recommendations, fertilizer advice, pest control, and farming techniques. What would you like to know about agriculture today?`;

export default function TextGenerateEffectDemo() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Text Generation Effect Demo</h1>

      {/* Fast typing effect */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Fast Typing (50ms delay)</h2>
        <TextGenerateEffect
          words={words}
          delay={0.05}
          className="text-base font-normal"
          onComplete={() => console.log("Fast typing complete!")}
        />
      </div>

      {/* Medium typing effect */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Medium Typing (100ms delay)</h2>
        <TextGenerateEffect
          words={words}
          delay={0.1}
          className="text-base font-normal"
          filter={false}
          onComplete={() => console.log("Medium typing complete!")}
        />
      </div>

      {/* Slow typing with blur effect */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Slow Typing with Blur (200ms delay)</h2>
        <TextGenerateEffect
          words={words}
          delay={0.2}
          className="text-base font-normal"
          filter={true}
          onComplete={() => console.log("Slow typing complete!")}
        />
      </div>
    </div>
  );
}