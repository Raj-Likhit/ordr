"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { HelpCircle, MessageSquare } from "lucide-react";

interface QA {
  id: string;
  question_text: string;
  answer_text: string | null;
  created_at: string;
  answered_at: string | null;
}

export function ProductQA({ productId }: { productId: string }) {
  const [questions, setQuestions] = useState<QA[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/qa?productId=${productId}`);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, question_text: newQuestion })
      });
      if (res.ok) {
        setNewQuestion("");
        fetchQuestions();
      } else {
        alert('Failed to submit question');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 border-t border-[var(--color-border)] pt-12">
      <h2 className="font-display text-[var(--text-title)] mb-8 flex items-center gap-2">
        <HelpCircle size={24} className="text-[var(--color-text-secondary)]" />
        Customer Q&A
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {fetching ? (
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-20 bg-[var(--color-border)] rounded-[var(--radius-md)]"></div>
              <div className="h-20 bg-[var(--color-border)] rounded-[var(--radius-md)]"></div>
            </div>
          ) : questions.length === 0 ? (
            <p className="text-[var(--color-text-secondary)]">No questions have been asked about this product yet.</p>
          ) : (
            questions.map(q => (
              <div key={q.id} className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]">
                <div className="flex gap-4">
                  <span className="font-display text-xl font-bold text-[var(--color-text-muted)]">Q</span>
                  <div>
                    <p className="font-medium text-[var(--text-body)]">{q.question_text}</p>
                    <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-1">Asked on {new Date(q.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {q.answer_text ? (
                  <div className="flex gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
                    <span className="font-display text-xl font-bold text-[var(--color-accent)]">A</span>
                    <div>
                      <p className="text-[var(--text-body)] text-[var(--color-text-secondary)]">{q.answer_text}</p>
                      <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-1">Answered by Vendor on {new Date(q.answered_at!).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-[var(--text-small)] text-[var(--color-text-muted)] flex items-center gap-2">
                    <MessageSquare size={14} /> Waiting for vendor response
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div>
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)] sticky top-8">
            <h3 className="font-display text-[var(--text-subtitle)] mb-4">Have a question?</h3>
            <p className="text-[var(--text-small)] text-[var(--color-text-secondary)] mb-4">
              Ask the vendor directly. Questions and answers will be visible to all customers.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                placeholder="What would you like to know?"
                required
                className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-[var(--color-accent)] min-h-[100px] resize-none"
              />
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Post Question'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
