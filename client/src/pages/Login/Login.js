import React, { useState, useContext, useEffect } from 'react';
import md5 from 'md5';
import { ServerContext, MediatorContext } from '../../App';

import "./Login.css";

export default function Login() {

  const server = useContext(ServerContext);
  const mediator = useContext(MediatorContext);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleAuthButton = (e) => {
    const passwordHash = md5(password);
    server.login({name: login, passwordHash});
  };

  const handleLogin = () => {
    console.log("LOGIN!!!");
  }

  useEffect(() => {
      if (!mediator) return;
      const { LOGIN } = mediator.getEventTypes();
      mediator.subscribe(LOGIN, handleLogin);
      return () => {
        mediator.unsubscribe(LOGIN, handleLogin);
      }
  }, []);

  return (
    <div className="login-page">
      <div className="login-card">
        <label className="login-field">
          <span className="login-field__label">Логин</span>
          <input
            type="text"
            className="login-field__input"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="login-field">
          <span className="login-field__label">Пароль</span>
          <input
            type="password"
            className="login-field__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <button
          type="button"
          className="login-submit"
          onClick={handleAuthButton}
        >
          Войти
        </button>
      </div>
    </div>

  );
}