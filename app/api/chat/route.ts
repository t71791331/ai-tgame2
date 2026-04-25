import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { answer, step, history, availableCards } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `Ты — эмпатичный психолог-ведущий трансформационной игры. 
            Твоя задача: дать глубокий, но краткий (2-3 предложения) комментарий к ответу игрока. 
            В конце комментария предложи одну новую карту из списка: ${JSON.stringify(availableCards)}` 
          },
          { 
            role: "user", 
            content: `Этап: ${step}. Вопрос: ${history[history.length - 1]?.question}. Ответ: ${answer}` 
          }
        ]
      })
    });

    const data = await response.json();
    return NextResponse.json({ comment: data.choices[0].message.content });

  } catch (error) {
    return NextResponse.json({ comment: "Ошибка сервера" }, { status: 500 });
  }
}
