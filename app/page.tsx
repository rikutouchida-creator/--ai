'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'お疲れ様です。専属秘書でございます。本日はどのような件をごサポートいたしましょうか？',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 初期感情ステート（Phase 2で自動変動ロジックを組込予定）
  const [emotionalState] = useState({
    affinity: 15,
    trust: 20,
    mood: '穏やか・誠実',
  });

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          emotionalState,
          userProfile: { job: '証券アナリスト' },
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: data.text },
        ]);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {/* ステータスバー */}
      <header style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>専属秘書 AI</h1>
        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#4b5563' }}>
          <span>親密度: {emotionalState.affinity}</span>
          <span>信頼度: {emotionalState.trust}</span>
          <span>状態: {emotionalState.mood}</span>
        </div>
      </header>

      {/* チャット画面 */}
      <section style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              backgroundColor: m.role === 'user' ? '#2563eb' : '#ffffff',
              color: m.role === 'user' ? '#ffffff' : '#1f2937',
              border: m.role === 'user' ? 'none' : '1px solid #e5e7eb',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>秘書が思考中...</div>}
      </section>

      {/* 入力送信欄 */}
      <footer style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
        <input
          type="text"
          style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
          placeholder="秘書に指示または相談を入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}
        >
          送信
        </button>
      </footer>
    </main>
  );
}
