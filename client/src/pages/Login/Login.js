import { useState } from "react";
import "./Login.css";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Вход:", { login, password });
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
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

        <button type="submit" className="login-submit">
          Войти
        </button>
      </form>
    </div>
  );
}