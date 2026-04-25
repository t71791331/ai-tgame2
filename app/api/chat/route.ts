import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { answer, step } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    // Запрос к Groq (бесплатно)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "Ты эмпатичный психолог-проводник. Дай короткий и мудрый ответ на мысли игрока." 
          },
          { 
            role: "user", 
            content: `Этап игры: ${step}. Мысли игрока: ${answer}` 
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Это выведет конкретную ошибку от провайдера ИИ
      return NextResponse.json({ comment: `Ошибка AI: ${data.error?.message || "Неизвестно"}` }, { status: 500 });
    }

    return NextResponse.json({ 
      comment: data.choices[0].message.content 
    });

  } catch (error) {
    return NextResponse.json({ comment: "Проблема в настройках сервера." }, { status: 500 });
  }
}
