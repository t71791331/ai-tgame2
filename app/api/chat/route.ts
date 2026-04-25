import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Проверяем, приходят ли данные из формы
    const body = await req.json();
    const { answer, step } = body;

    // 2. Проверяем, видит ли сервер ваш ключ
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ comment: "Ошибка: Ключ API не найден в настройках Vercel." }, { status: 200 });
    }

    // 3. Пытаемся достучаться до Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Ты — краткий психолог-проводник." },
          { role: "user", content: `Этап: ${step}. Ответ: ${answer}` }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ comment: `Ошибка API: ${data.error?.message || "Что-то не так с ключом"}` }, { status: 200 });
    }

    return NextResponse.json({ comment: data.choices[0].message.content });

  } catch (error) {
    // Если код упал совсем — выводим это сообщение
    return NextResponse.json({ comment: "Критическая ошибка сервера. Проверьте логи в Vercel." }, { status: 200 });
  }
}
