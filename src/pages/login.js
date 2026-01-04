import { useState } from 'react';
import { login } from '../firebase/auth'; // Import the login function
import styles from '../styles/login.module.css';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isLoggedIn = await login(email, password);
    if (isLoggedIn) {
      // Redirect to home or dashboard after successful login
      window.location.href = '/home'; // Example redirect
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    await sendPasswordReset(email);
  };

  return (
    <div className={styles['login-card']}>
      <h2 className={styles['h2-title']}>LOGIN</h2>

      <form id="loginForm" onSubmit={handleSubmit}>
        <input 
          type="email" 
          id="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        <input 
          type="password" 
          id="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
        <button type="submit" className="login-btn">Login</button>
      </form>

      <div className={styles['form-footer']}>
        <a href="#" onClick={handlePasswordReset}>Forgot Password?</a>
        <a href="/signup">Sign Up</a>
      </div>

      <div className={styles['footer']}>
        Made with ❤️ by Team Asparagus
      </div>
    </div>
  );
};

export default LoginPage;
