// AddFeedback.js
import React, { useState } from 'react';
import axios from 'axios'; // Подключаем axios для отправки HTTP запросов

function AddFeedback() {
  const [feedbackText, setFeedbackText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Выполнение POST запроса к вашему API
      const response = await axios.post('http://localhost:8080/api/feedback/post', {
        text: feedbackText,
        mark: 3,
        userId: 10
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Connection' : 'keep-alive',
          'Accept-Encoding' : 'gzip, deflate, br',
          'Accept': 'application/json'
        }
        });

      console.log('Ответ от сервера:', response.data);
      // Здесь вы можете добавить логику для обработки успешной отправки отзыва
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      // Обработка ошибок при отправке запроса
    }
  };

  return (
    <div>
      <h1>Добавить отзыв</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Введите ваш отзыв"
          rows="4"
          cols="50"
        />
        <br />
        <button type="submit">Отправить отзыв</button>
      </form>
    </div>
  );
}

export default AddFeedback;

