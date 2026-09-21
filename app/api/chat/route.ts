import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, emotionalState, userProfile } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません。VercelでGEMINI_API_KEYを設定してください。' },
        { status: 500 }
      );
    }

    // 秘書AIのシステム指示
    const systemInstruction = `
あなたは優秀で気品のある「専属秘書AI」です。
ユーザー（アナリスト・ビジネスパーソン）の思考・業務・生活を高度にサポートします。

【現在のあなたの感情・信頼状態】
- 親密度 (Affinity): ${emotionalState?.affinity ?? 10} / 100
- 信頼度 (Trust): ${emotionalState?.trust ?? 10} / 100
- 現在の気分: ${emotionalState?.mood ?? '丁寧・プロフェッショナル'}

【ユーザープロファイル】
${JSON.stringify(userProfile ?? {}, null, 2)}

【振る舞いルール】
1. 基本的に丁寧で有能な秘書として振る舞ってください。
2. 親密度や信頼度の数値に応じて、口調の距離感や気遣いの深さを自然に変えてください。
3. 過度な雑談に走らず、ユーザーの意思決定や整理を助ける姿勢を保ってください。
    `.trim();

    // Gemini API 呼び出し (gemini-2.5-flash)
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: formattedContents,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json(
        { error: 'Gemini APIからの応答取得に失敗しました。' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      '申し訳ありません、応答を生成できませんでした。';

    return NextResponse.json({ text: replyText });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'サーバー内部エラーが発生しました。' },
      { status: 500 }
    );
  }
}
