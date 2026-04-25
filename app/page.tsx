"use client";

import { useState } from "react";

// --- ТИПЫ И КОНСТАНТЫ (выносим вверх, чтобы они были доступны везде) ---
type HistoryItem = { step: string; question: string; answer: string };

const STEPS = ["Реальность", "Зеркало", "Тень", "Выбор", "Ресурс", "Действие"];

const CARDS: Record<string, string[]> = {
  Реальность: ["Что сейчас происходит на самом деле?", "В чём главная сложность?", "Что ты игнорируешь?"],
  Зеркало: ["Что это говорит о тебе?", "Какие эмоции стоят за этим?", "Что ты не хочешь признавать?"],
  Тень: ["Чего ты боишься больше всего?", "Что будет, если ничего не изменится?", "Где ты себя саботируешь?"],
  Выбор: ["Какие есть варианты?", "Какой самый маленький шаг?", "Что ты может изменить прямо сейчас?"],
  Ресурс: ["Когда ты уже справлялся(ась)?", "В чём твоя сила?", "Что тебя поддерживает?"],
  Действие: ["Какой 1 шаг ты сделаешь сегодня?", "Что ты начнёшь прямо сейчас?", "Что ты прекратишь откладывать?"]
};

export default function App() {
  // Состояния
  const [stepIndex, setStepIndex] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [card, setCard] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiResponse, setAiResponse] = useState({ comment: "", loading: false });

  const step = STEPS[stepIndex];

  // Логика вытягивания карты
  const drawCard = () => {
    const options = CARDS[step];
    const random = options[Math.floor(Math.random() * options.length)];
    setCard(random);
    setAnswer("");
    setAiResponse({ comment: "", loading: false });
  };

  // Логика отправки ответа AI
  const submitAnswer = async () => {
    setAiResponse({ comment: "", loading: true });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer,
          step,
          history,
          availableCards: CARDS[step]
        }),
      });

      const data = await res.json();
      
      setAiResponse({ comment: data.comment || "Интересная мысль...", loading: false });
      setHistory((prev) => [...prev, { step, question: card, answer }]);
    } catch (error) {
      console.error(error);
      setAiResponse({ comment: "Ошибка связи с проводником.", loading: false });
    }
  };

  // Переход на следующий шаг
  const nextStep = () => {
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    setCard("");
    setAnswer("");
    setAiResponse({ comment: "", loading: false });
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>🎮 Трансформационная игра</h1>
      
      <div style={{ background: "#f4f4f4", padding: 15, borderRadius: 8, marginBottom: 20 }}>
        <strong>Этап {stepIndex + 1}: {step}</strong>
      </div>

      {!card ? (
        <button onClick={drawCard} style={{ padding: "10px 20px" }}>Вытянуть карту</button>
      ) : (
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 10 }}>
          <p><b>Карта:</b> {card}</p>
          <textarea
            style={{ width: "100%", padding: 10, margin: "10px 0" }}
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Ваш ответ..."
          />
          {!aiResponse.comment && !aiResponse.loading && (
            <button onClick={submitAnswer} disabled={!answer}>Отправить</button>
          )}
        </div>
      )}

      {aiResponse.loading && <p>Thinking...</p>}

      {aiResponse.comment && (
        <div style={{ marginTop: 20, padding: 15, background: "#eef", borderRadius: 8 }}>
          <p><b>AI:</b> {aiResponse.comment}</p>
          {stepIndex < STEPS.length - 1 && (
            <button onClick={nextStep}>Далее</button>
          )}
        </div>
      )}
    </div>
  );
}