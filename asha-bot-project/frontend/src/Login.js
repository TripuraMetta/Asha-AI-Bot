const LoginContent = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #ff7e5f, #feb47b);
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: #333;
        }
        .login-container {
          background: white;
          padding: 30px;
          max-width: 400px;
          border-radius: 15px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          text-align: center;
        }
        h2 { color: #2c3e50; margin-bottom: 10px; }
        p { color: #7f8c8d; font-size: 0.9em; margin: 10px 0; }
        input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 25px;
          font-size: 1em;
          box-sizing: border-box;
        }
        .show-button {
          padding: 5px 10px;
          background: none;
          border: none;
          color: #3498db;
          cursor: pointer;
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
        }
        .login-button, .google-button {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: none;
          border-radius: 25px;
          font-size: 1em;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .login-button { background: #3498db; color: white; }
        .google-button { background: #fff; color: #2c3e50; }
        .login-button:hover, .google-button:hover { transform: scale(1.05); }
        .forgot-password { color: #3498db; text-decoration: none; font-size: 0.9em; display: block; margin: 5px 0; }
        .separator { display: flex; align-items: center; margin: 20px 0; }
        .separator p { margin: 0 10px; color: #7f8c8d; }
        .separator hr { flex: 1; border: 0; height: 1px; background: #ddd; }
        .otp-input { display: none; }
        .otp-show { display: block; }
        .google-icon {
          margin-right: 8px;
          font-size: 1.5em;
          background: linear-gradient(90deg, #4285F4, #DB4437, #F4B400, #0F9D58);
          -webkit-background-clip: text;
          color: transparent;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <h2>Login</h2>
        <input type="text" name="email" placeholder="Email ID / Username" required>
        <div style="position: relative;">
          <input type="password" name="password" placeholder="Password" required>
          <button type="button" class="show-button" onclick="this.parentElement.querySelector('input').type = this.parentElement.querySelector('input').type === 'password' ? 'text' : 'password'">Show</button>
        </div>
        <a href="#forgot" class="forgot-password">Forgot Password?</a>
        <button type="submit" class="login-button">Login</button>
        <p id="otp-option" style="cursor: pointer; color: #3498db;" onclick="document.getElementById('otp-input').classList.add('otp-show'); this.style.display='none';">Use OTP to Login</p>
        <div id="otp-input" class="otp-input">
          <input type="text" name="otp" placeholder="Enter OTP" required>
          <button type="submit" class="login-button" id="otp-login">Verify OTP</button>
        </div>
        <div class="separator"><hr /><p>or</p><hr /></div>
        <button class="google-button" id="google-login">
          <span class="google-icon">G</span>Sign in with Google
        </button>
      </div>
      <script>
        document.querySelectorAll('button[type="submit"]').forEach(button => {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            let email, password, otp;
            if (this.textContent === 'Login') {
              email = document.querySelector('input[name="email"]').value;
              password = document.querySelector('input[name="password"]').value;
            } else if (this.id === 'otp-login') {
              email = document.querySelector('input[name="email"]').value;
              otp = document.querySelector('input[name="otp"]').value;
              if (otp === '123456') { // Hardcoded OTP for simulation
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.email === email);
                if (user) {
                  alert('OTP Login successful! Welcome, ' + user.name);
                  window.opener.postMessage({ type: 'loginSuccess', user }, '*');
                  window.close();
                } else {
                  alert('User not found with this email!');
                }
              } else {
                alert('Invalid OTP! Please try again.');
              }
              return;
            }
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => (u.email === email || u.phone === email) && u.password === password);
            if (user) {
              alert('Login successful! Welcome, ' + user.name);
              window.opener.postMessage({ type: 'loginSuccess', user }, '*');
              window.close();
            } else {
              alert('Invalid email/phone or password!');
            }
          });
        });

        document.getElementById('google-login').addEventListener('click', function(e) {
          e.preventDefault();
          let name = prompt('Please enter your name for Google login:');
          if (!name) {
            alert('Name is required for Google login!');
            return;
          }
          const email = 'user@gmail.com'; // Simulating a Google login with a default Gmail
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const existingUser = users.find(user => user.email === email);
          if (existingUser) {
            alert('Welcome back, ' + existingUser.name + '!');
            window.opener.postMessage({ type: 'loginSuccess', user: existingUser }, '*');
          } else {
            const newUser = { name: name, email: email, phone: '', password: 'google-auth' };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            alert('Successfully signed in with Google!');
            window.opener.postMessage({ type: 'loginSuccess', user: newUser }, '*');
          }
          window.close();
        });
      </script>
    </body>
  </html>
`;

export default LoginContent;