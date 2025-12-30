// ============================================================================
// FILE: components/sections/Companion.tsx
// AI Companion (Lib) section - New Professional Design
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Sparkles } from 'lucide-react';

export const Companion: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hola, soy Lib. ¿En qué te puedo acompañar hoy? Estoy aquí para escucharte, sin juicios ni presiones.",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: "user",
      content: input,
    };

    // Simulate AI response
    const aiMessage = {
      id: messages.length + 2,
      role: "assistant",
      content:
        "Gracias por compartir eso conmigo. Entiendo que puede ser difícil. ¿Cómo te hace sentir esta situación?",
    };

    setMessages([...messages, userMessage, aiMessage]);
    setInput("");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-4xl font-bold">Lib, tu compañera</h1>
          <p className="text-muted-foreground">Un espacio para reflexionar y ser escuchado</p>
        </div>

        {/* Chat Container */}
        <Card className="flex h-[600px] flex-col">
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback
                    className={message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-secondary"}
                  >
                    {message.role === "assistant" ? <Sparkles className="h-5 w-5" /> : "Tú"}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe lo que sientes..."
                className="w-full p-5 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B9D] focus:border-transparent text-gray-700 placeholder-gray-400 min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                aria-label="Escribe tu mensaje"
              />
              <Button onClick={handleSend} size="lg" className="h-[60px] w-[60px] p-0">
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Presiona Enter para enviar, Shift + Enter para nueva línea</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
