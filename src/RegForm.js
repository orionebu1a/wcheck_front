
import React, { useState } from 'react';

const RegForm = () => {
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async() => {
    const response = await fetch('http://localhost:8080/api/register', {
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
      throw new Error('Ошибка регистрации');
    }
    console.log('Регистрация:', { userName, password });
  };

  return (
    <div>
      <h2>Регистрация</h2>
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
      <button onClick={handleRegister}>Зарегистрироваться</button>
    </div>
  );
};

export default RegForm;
