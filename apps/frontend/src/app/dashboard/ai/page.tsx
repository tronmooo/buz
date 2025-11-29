'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useBusinessStore } from '@/hooks/useBusiness';
import { useAISummary, useAIInsights, useAIAsk } from '@/hooks/useAI';
import { Sparkles, Send, Loader2, Bot, User, Lightbulb } from 'lucide-react';

export default function AIPage() {
  const { currentBusiness } = useBusinessStore();
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
  }>>([]);

  const { data: summaryData, isLoading: isLoadingSummary, refetch: refetchSummary } = useAISummary(
    currentBusiness?.id
  );

  const { data: insightsData } = useAIInsights(currentBusiness?.id);

  const askMutation = useAIAsk(currentBusiness?.id);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    askMutation.mutate(question, {
      onSuccess: (data) => {
        setConversation([
          ...conversation,
          { role: 'user', content: data.question },
          { role: 'assistant', content: data.answer },
        ]);
        setQuestion('');
      },
    });
  };

  if (!currentBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a business first</p>
        <Button className="mt-4" onClick={() => (window.location.href = '/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary-600" />
            AI Assistant
          </h1>
          <p className="text-gray-600 mt-1">
            Get insights, summaries, and answers about your business
          </p>
        </div>
      </div>

      {/* Business Summary */}
      <Card title="Business Summary">
        {isLoadingSummary ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : summaryData ? (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">
              {summaryData.summary}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchSummary()}
              className="mt-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate Summary
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Bot className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No summary generated yet
            </h3>
            <p className="text-gray-600 mb-4">
              Generate an AI-powered summary of your business
            </p>
            <Button onClick={() => refetchSummary()}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Summary
            </Button>
          </div>
        )}
      </Card>

      {/* AI Insights */}
      {insightsData && insightsData.insights.length > 0 && (
        <Card title="Recent Insights">
          <div className="space-y-4">
            {insightsData.insights.map((insight: any) => (
              <div
                key={insight.id}
                className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(insight.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Chat */}
      <Card title="Ask AI Anything">
        <div className="space-y-4">
          {/* Conversation History */}
          {conversation.length > 0 && (
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Bot className="w-8 h-8 text-primary-600 flex-shrink-0" />
                  )}
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <User className="w-8 h-8 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Suggested Questions */}
          {conversation.length === 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'What are my top expenses this month?',
                  'How is my cash flow looking?',
                  'Which customers owe me money?',
                  'What should I focus on this week?',
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(suggestion)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleAsk} className="flex gap-3">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your business..."
              className="flex-1"
              disabled={askMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!question.trim() || askMutation.isPending}
              isLoading={askMutation.isPending}
            >
              {askMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Ask
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
