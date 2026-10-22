'use client';
 
import { useChat } from '@ai-sdk/react';
import { useState, Suspense } from 'react';
import  Weather  from './Weather'
import { WeatherData } from './Weather'

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

 
export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat();
  // - Extract: messages and sendMessage
 const isLoading = status === "streaming" || status === "submitted";


  return (
    <div className="flex flex-col h-screen">
      <Conversation>
       <ConversationContent>
          {messages.length === 0 ? (
        <ConversationEmptyState
          title="Start a conversation"
          description="Type a message below to begin"
        />
      ) : (
      messages.map((message) => (
       <Message key={message.id} from={message.role}>
       <MessageContent>
        {message.role === 'assistant' ? (
        message.parts?.map((part, i) => {
    switch (part.type) {
      case "text":
        return (
          <MessageResponse key={`${message.id}-${i}`}>
            {part.text}
          </MessageResponse>
        );
      case "tool-getWeather":  // Tool parts are named "tool-TOOLNAME"
        // For now, show raw JSON to see what we're working with
        return (
                (part.state === 'output-available' && part.output)? (<Weather key={part.toolCallId || `${message.id}-${i}`} weatherData={part.output as WeatherData} />) :
                (
               <Tool key={part.toolCallId || `${message.id}-${i}`}>
              <ToolHeader type={part.type} state={part.state} />
              <ToolContent>
               <ToolInput input={part.input} />
                <ToolOutput
                  output={JSON.stringify(part.output, null, 2)}
                   errorText={part.errorText}
                />
              </ToolContent>
              </Tool>
                )
              
      
            );
      default:
        return null;
    }
  })
      ) : (
        message.parts?.map((part) =>
          part.type === 'text' && part.text
        )
      )}
       </MessageContent>
      </Message>
      )))}
       </ConversationContent>
         </Conversation>
 
      <div className="border-t p-4">
  <PromptInput
    onSubmit={(message, event) => {
      event.preventDefault();
      if (message.text) {
        sendMessage({ text: message.text });
        setInput("");
      }
    }}
    className="max-w-3xl mx-auto flex gap-2 items-end"
  >
    <PromptInputTextarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Type your message..."
      disabled={isLoading}
      rows={1}
      className="flex-1"
    />
    <PromptInputSubmit disabled={isLoading} />
  </PromptInput>
</div>
    </div>
  );
}