'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { getAuthToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ChatMessage {
  id: string;
  content: string;
  agent: 'orchestrator' | 'urdu';
  timestamp: string;
  isUser: boolean;
}

export default function ChatbotPage() {
  const auth = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !auth?.isAuthenticated || isSending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      agent: 'orchestrator',
      timestamp: new Date().toISOString(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Authentication required');

      const response = await apiClient<{
        response: string;
        agent: 'orchestrator' | 'urdu';
        timestamp: string;
      }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage.content })
      }, token);

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        agent: response.agent,
        timestamp: response.timestamp,
        isUser: false
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Show loading state while checking authentication
  if (auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-structure font-mono">Loading chatbot...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!auth.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md p-8 bg-surface border border-wireframe rounded-sm">
          <h2 className="font-serif text-2xl font-bold text-structure mb-4">Authentication Required</h2>
          <p className="text-text-secondary mb-6">Please log in to access the chatbot.</p>
          <a href="/login" className="inline-block bg-accent text-white px-6 py-3 rounded-sm hover:bg-accent-hover transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto p-4 md:p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-wireframe">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-structure">
            Task Management Chatbot
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Dual-agent system with Urdu specialization
          </p>
        </div>
        <div className="text-right text-sm text-text-secondary">
          <div className="font-medium text-structure">👤 {auth.user?.name || 'User'}</div>
          <div className="font-mono text-xs mt-1">{auth.user?.email}</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-background rounded-sm border border-wireframe space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-sm px-4 py-3 ${
                  message.isUser
                    ? 'bg-accent text-white'
                    : 'bg-surface border border-wireframe'
                }`}
              >
                {/* Agent Attribution */}
                {!message.isUser && (
                  <div className="text-xs font-mono mb-1 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded ${
                      message.agent === 'urdu'
                        ? 'bg-structure text-white'
                        : 'bg-accent text-white'
                    }`}>
                      {message.agent === 'urdu' ? '🇵🇰 Urdu Specialist' : '🤖 Orchestrator'}
                    </span>
                    <span className="text-text-secondary">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {/* Message Content */}
                <div className={`font-sans text-sm leading-relaxed ${
                  message.isUser ? 'text-white' : 'text-structure'
                }`}>
                  {message.content}
                </div>

                {/* Timestamp for user messages */}
                {message.isUser && (
                  <div className="text-xs mt-1 text-white/80 font-mono">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isSending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-surface border border-wireframe rounded-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/10 border border-accent rounded-sm px-4 py-3"
          >
            <p className="text-accent font-mono text-sm">⚠️ {error}</p>
          </motion.div>
        )}

        {/* Empty State */}
        {messages.length === 0 && !isSending && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-text-secondary font-serif text-lg mb-2">Welcome to your AI assistant</p>
            <p className="text-text-secondary text-sm">Start a conversation to manage your tasks</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message... (Try: 'Create task Buy groceries with high priority')"
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isSending || !inputValue.trim()}
            variant="primary"
            className="px-6 font-medium"
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>

        {/* Quick Examples */}
        <div className="flex gap-2 flex-wrap">
          {[
            'Create task Buy groceries with high priority',
            'Show me my tasks',
            'کیا آپ میری مدد کر سکتے ہیں؟',
            'Update my latest task to completed',
            'What are my task statistics?'
          ].map((example) => (
            <Button
              key={example}
              variant="technical"
              size="sm"
              onClick={() => !isSending && setInputValue(example)}
              disabled={isSending}
              className="text-xs"
            >
              {example.length > 35 ? example.substring(0, 35) + '...' : example}
            </Button>
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-2 p-3 bg-surface border border-wireframe rounded-sm text-xs font-mono text-text-secondary">
          <strong className="text-structure">System Info:</strong> Dual-agent system with Urdu specialization.
          Orchestrator handles general tasks, Urdu specialist responds in Urdu.
          All operations use MCP tools with user isolation.
          <span className="text-accent"> Your data is secure and isolated.</span>
        </div>
      </div>
    </div>
  );
}