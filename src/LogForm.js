
import React, { useState } from 'react';

const LogForm = () => {
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async() => {
    const response = await fetch('http://localhost:8080/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Connection' : 'keep-alive',
        'Accept-Encoding' : 'gzip, deflate, br',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        userName,
        password
      }),
    });
    if (!response.ok) {
      throw new Error('Ошибка входа');
    }
    console.log('Вход:', { userName, password });
  };

  return (
    <div>
      <h2>Вход</h2>
      <label>
        Имя пользователя:
        <input type="text" value={userName} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <br />
      <label>
        Пароль:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <br />
      <button onClick={handleLogin}>Войти</button>
    </div>
  );
};

export default LogForm;
