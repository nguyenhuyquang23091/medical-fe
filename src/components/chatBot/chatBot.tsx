"use client"
import { BotMessageSquare, Minus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import chatbotService from '@/actions/chatbot/chatBot';
import { ChatMessage } from '@/types';
import { Typewriter } from '@/components/ui/typewriter';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add initial welcome messages when chat is opened
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          content: 'What brings you here today?\nPlease use the navigation below or ask me anything about ChatBot product. ✏️',
          isBot: true,
        }
      ]);
    }
  }, [isOpen]);

  const handleToggleChat = () => {
    setIsAnimating(true);
    setIsOpen(!isOpen);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    try {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: ChatMessage = {
        content: inputValue,
        isBot: false,
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');

      // Get bot response
      const response = await chatbotService.ask(inputValue);
      
      // Add bot response
      const botMessage: ChatMessage = {
        content: response.content,
        isBot: true,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        content: "I'm sorry, I couldn't process your request. Please try again.",
        isBot: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <Card 
          className={cn(
            "mb-4 w-[350px] overflow-hidden rounded-2xl shadow-lg",
            "transition-all duration-500 ease-out origin-bottom-right",
            "animate-in zoom-in-95 duration-500"
          )}
        >
          <div className="flex flex-col h-[500px]">
            {/* Chat Header */}
            <div className="bg-white flex items-center justify-between border-b h-[45px] min-h-[45px] w-full">
              <div className="flex items-center gap-2 px-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-gray-100 transition-colors duration-300 cursor-pointer h-7 w-7 p-0"
                  onClick={handleToggleChat}
                >
                  <span className="sr-only">Back</span>
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center transition-transform duration-500 hover:scale-110">
                    <BotMessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold">ChatBot</h3>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-gray-100 transition-colors duration-300 cursor-pointer h-7 w-7 p-0 mr-3"
                onClick={handleToggleChat}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Minimize</span>
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'max-w-[80%] space-y-1',
                    'animate-in slide-in-from-bottom-3 duration-300',
                    message.isBot ? '' : 'ml-auto'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={cn(
                      'rounded-2xl p-3',
                      'transition-all duration-200',
                      message.isBot
                        ? 'bg-white text-gray-900 rounded-tl-none'
                        : 'bg-blue-600 text-white rounded-br-none'
                    )}
                  >
                    {message.isBot ? (
                      <Typewriter 
                        text={message.content}
                        typeSpeed={30}
                        renderMarkdown={true}
                        className={cn(
                          "prose prose-sm max-w-none",
                          "prose-p:leading-normal prose-p:my-1",
                          "prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-gray-100",
                          "prose-pre:p-0 prose-pre:my-0 prose-pre:bg-transparent"
                        )}
                        markdownComponents={{
                          p: ({ children }) => <p className="my-1">{children}</p>,
                          code: ({ children }) => (
                            <code className="bg-gray-100 px-1 py-0.5 rounded-md">{children}</code>
                          ),
                        }}
                      />
                    ) : (
                      message.content
                    )}
                  </div>
                  {!message.isBot && (
                    <p className="text-xs text-gray-500 text-right animate-fade-in">Delivered</p>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="max-w-[80%] space-y-1">
                  <div className="bg-white text-gray-900 rounded-2xl rounded-tl-none p-3 animate-pulse">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="border-t bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 rounded-full border px-4 py-2 focus:border-blue-500 focus:outline-none bg-gray-50 transition-all duration-200 disabled:opacity-50"
                />
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'bg-blue-600 hover:bg-blue-700 rounded-full px-6 transition-colors duration-200 cursor-pointer w-[70px]',
                    isLoading && 'opacity-50'
                  )}
                >
                  {isLoading ? '...' : 'Send'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Chat Toggle Button */}
      <Button
        onClick={handleToggleChat}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 group cursor-pointer",
          "transition-all ease-out transform origin-center",
          isAnimating && (isOpen 
            ? "scale-[0.4] opacity-0" 
            : "scale-110 opacity-100"),
          !isAnimating && "hover:scale-105",
          isOpen ? "invisible" : "visible"
        )}
      >
        <BotMessageSquare 
          className={cn(
            "h-6 w-6 text-white",
            "transition-all duration-500 transform",
            isAnimating && (isOpen 
              ? "scale-0" 
              : "scale-100")
          )} 
        />
      </Button>
    </div>
  );
};

export default ChatBot;


