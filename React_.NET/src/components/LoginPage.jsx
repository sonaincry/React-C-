import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password, rememberMe });
  };

  return (
    <div className="login-container">
      <div className="login-grid">

        <div className="login-form-container">
          <h2 className="login-heading">ĐĂNG NHẬP</h2>
          <form className="login-form" onSubmit={handleLogin}>
            <label>Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              placeholder="Enter username"
              onChange={(e) => setUsername(e.target.value)}
            />

            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>

            <button type="submit" className="login-button">Đăng nhập</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
