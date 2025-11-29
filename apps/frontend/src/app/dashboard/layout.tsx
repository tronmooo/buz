'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Bot, Lightbulb, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useBusinessStore } from '@/hooks/useBusiness';
import { useAIAsk, useAIInsights } from '@/hooks/useAI';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { currentBusiness } = useBusinessStore();
  const [globalQuery, setGlobalQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const askMutation = useAIAsk(currentBusiness?.id);
  const { data: insightsData, isLoading: insightsLoading } = useAIInsights(
    currentBusiness?.id
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = globalQuery.trim();
    if (!query) return;
    setGlobalQuery('');
    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
  };

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = aiPrompt.trim();
    if (!prompt) return;
    setAiPrompt('');
    askMutation.mutate(prompt, {
      onSuccess: (data) => {
        setAiResponse(data.answer);
      },
      onError: (err: any) => {
        const message = err?.message || 'Unable to reach AI service';
        setAiResponse(message);
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-4 px-6">
          <form
            onSubmit={handleGlobalSearch}
            className="flex items-center gap-2 w-full max-w-xl bg-gray-100 rounded-lg px-3 py-2"
          >
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="search"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Global search across contacts, invoices, tickets..."
              className="bg-transparent flex-1 text-sm outline-none"
            />
          </form>

          <form
            onSubmit={handleQuickAsk}
            className="hidden lg:flex items-center gap-2 w-full max-w-md bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-primary-600" />
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask AI to draft an email or summarize last week"
              className="bg-transparent flex-1 text-sm outline-none"
            />
            <Button type="submit" size="sm" isLoading={askMutation.isPending}>
              Ask
            </Button>
          </form>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto p-8">{children}</main>

          <aside className="hidden xl:block w-80 border-l border-gray-200 bg-white overflow-auto p-4 space-y-4">
            <Card
              title="AI Context"
              action={
                <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/ai')}>
                  Open AI
                </Button>
              }
            >
              <p className="text-sm text-gray-600">
                Right-side assistant surfaces quick answers and recent insights for the selected business.
              </p>
              {aiResponse ? (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 flex gap-2">
                  <Bot className="w-4 h-4 text-primary-600 mt-0.5" />
                  <span>{aiResponse}</span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                  <Bot className="w-4 h-4 text-primary-600" />
                  <span>Ask a question in the top bar to see it here.</span>
                </div>
              )}
            </Card>

            <Card title="Suggested Actions">
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>Connect email or banking integrations (Phase 2).</li>
                <li>Enable AI summaries for files and weekly reports.</li>
                <li>Add alerts on dashboard for invoices due and renewals.</li>
              </ul>
            </Card>

            <Card title="Recent Insights">
              {insightsLoading ? (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                </div>
              ) : insightsData && insightsData.insights.length > 0 ? (
                <div className="space-y-3">
                  {insightsData.insights.slice(0, 3).map((insight: any) => (
                    <div key={insight.id} className="text-sm text-gray-800">
                      <p className="font-semibold">{insight.title}</p>
                      <p className="text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No insights yet. Ask AI or generate a summary.</p>
              )}
            </Card>

            <Card title="Status">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
                <span>
                  Current business: {currentBusiness ? currentBusiness.name : 'none selected'}. AI layer is staged; connect data integrations to unlock insights.
                </span>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
