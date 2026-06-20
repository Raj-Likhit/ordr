"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VendorQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  const fetchQuestions = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const res = await fetch(`/api/qa?vendorId=${user.id}`);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswerSubmit = async (id: string) => {
    if (!answerText.trim()) return;
    try {
      const res = await fetch('/api/qa/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qa_id: id, answer_text: answerText })
      });
      if (res.ok) {
        setAnsweringId(null);
        setAnswerText("");
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unanswered = questions.filter(q => !q.answer_text);
  const answered = questions.filter(q => q.answer_text);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--color-accent)]" size={32} /></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light text-[var(--color-text-primary)] mb-2">Customer Questions</h1>
        <p className="text-[var(--color-text-secondary)]">Answer questions from customers about your products.</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl font-medium mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-[#CA8A04]" /> Needs Your Attention ({unanswered.length})
          </h2>
          {unanswered.length === 0 ? (
            <p className="text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]">You have answered all questions!</p>
          ) : (
            <div className="space-y-4">
              {unanswered.map(q => (
                <div key={q.id} className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium text-[var(--text-body)]">{q.question_text}</p>
                      <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-1">Product: {q.products?.title}</p>
                    </div>
                  </div>
                  {answeringId === q.id ? (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={answerText}
                        onChange={e => setAnswerText(e.target.value)}
                        placeholder="Write your answer..."
                        className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-[var(--color-accent)] min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={() => handleAnswerSubmit(q.id)}>Submit Answer</Button>
                        <Button variant="secondary" onClick={() => { setAnsweringId(null); setAnswerText(""); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="secondary" onClick={() => { setAnsweringId(q.id); setAnswerText(""); }}>Answer Question</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-medium mb-4 flex items-center gap-2 mt-12">
            <CheckCircle size={20} className="text-[#16A34A]" /> Answered Questions ({answered.length})
          </h2>
          <div className="space-y-4">
            {answered.map(q => (
              <div key={q.id} className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)] opacity-75">
                <p className="font-medium text-[var(--text-body)] mb-2">Q: {q.question_text}</p>
                <p className="text-[var(--color-text-secondary)]">A: {q.answer_text}</p>
                <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-3">Product: {q.products?.title}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
