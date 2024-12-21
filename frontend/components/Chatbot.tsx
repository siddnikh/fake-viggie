"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { chatService } from "@/lib/chat-service";
import { Student } from "@/lib/api-service";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
  status?: "error" | "success" | "not-implemented";
}

interface ChatbotProps {
  onFormUpdate: (fields: Partial<Student>) => void;
}

export function Chatbot({ onFormUpdate }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "👋 Hi! I'm DriveBot, your virtual driving assistant. Can I help you fill out the registration form?",
      isBot: true,
      timestamp: new Date(),
      status: "success",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(input);

      // Handle form filling action if present
      if (response.action?.type === "fillForm") {
        onFormUpdate(response.action.fields);
      }

      const botMessage: Message = {
        text: response.text,
        isBot: true,
        timestamp: new Date(),
        status: "success",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        text: "Sorry, I encountered an error. Please try again.",
        isBot: true,
        timestamp: new Date(),
        status: "error",
      };
      console.error(error);
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleMicClick = () => {
    const message: Message = {
      text: "Voice commands are not implemented yet.",
      isBot: true,
      timestamp: new Date(),
      status: "not-implemented",
    };
    setMessages((prev) => [...prev, message]);
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg text-2xl"
        onClick={() => setIsOpen(true)}
      >
        💬
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[32rem] shadow-xl flex flex-col bg-white/95 backdrop-blur-sm">
      <div className="p-4 border-b bg-primary text-white flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <div className="font-semibold text-lg">DriveBot</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-white/90"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.isBot ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.isBot ? "bg-gray-100" : "bg-primary text-white"
              }`}
            >
              {message.text}
              {message.status === "not-implemented" && (
                <div className="text-xs mt-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                  Not implemented yet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex gap-2 bg-gray-50">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button
          size="icon"
          variant="outline"
          className={`${isLoading ? "bg-red-100 text-red-600" : ""}`}
          onClick={handleMicClick}
        >
          🎙️
        </Button>
        <Button onClick={handleSend}>Send</Button>
      </div>
    </Card>
  );
}
