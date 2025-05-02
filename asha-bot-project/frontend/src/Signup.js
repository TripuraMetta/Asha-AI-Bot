const SignupContent = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #6e8efb, #a777e3);
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: #333;
        }
        .signup-container {
          background: white;
          padding: 30px;
          max-width: 400px;
          border-radius: 15px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          text-align: center;
        }
        h2 { color: #2c3e50; margin-bottom: 10px; }
        p { color: #7f8c8d; font-size: 0.9em; margin: 10px 0; }
        .social-button, .continue-button {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: none;
          border-radius: 25px;
          font-size: 1em;
          cursor: pointer;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .social-button { background: #fff; color: #2c3e50; }
        .continue-button { background: #3498db; color: white; }
        .social-button:hover, .continue-button:hover { transform: scale(1.05); }
        input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 25px;
          font-size: 1em;
          box-sizing: border-box;
        }
        .separator { display: flex; align-items: center; margin: 20px 0; }
        .separator p { margin: 0 10px; color: #7f8c8d; }
        .separator hr { flex: 1; border: 0; height: 1px; background: #ddd; }
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
      <div class="signup-container">
        <h2>Ready to take the next step?</h2>
        <p>Create an account or sign in.</p>
        <p>By creating an account or signing in, you understand and agree to Indeed's Terms. You also consent to our Cookie and Privacy policies. You will receive marketing messages from Indeed and may opt out at any time by following the unsubscribe link in our messages, or as detailed in our terms.</p>
        <button class="social-button" id="google-login">
          <span class="google-icon">G</span>Continue with Google
        </button>
        <div class="separator"><hr /><p>or</p><hr /></div>
        <form id="signup-form" style="text-align: left;">
          <input type="text" name="name" placeholder="Name" required>
          <input type="text" name="email" placeholder="Email address or phone number" required>
          <input type="text" name="phone" placeholder="Phone (optional)">
          <input type="password" name="password" placeholder="Password" required>
          <button type="submit" class="continue-button">Continue →</button>
        </form>
      </div>
      <script>
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
            window.opener.postMessage({ type: 'signupSuccess', user: newUser }, '*');
          }
          window.close();
        });

        document.getElementById('signup-form').addEventListener('submit', function(e) {
          e.preventDefault();
          const formData = {
            name: e.target.name.value,
            email: e.target.email.value,
            phone: e.target.phone.value,
            password: e.target.password.value
          };
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          if (users.some(user => user.email === formData.email || user.phone === formData.phone)) {
            alert('User already exists with this email or phone!');
            return;
          }
          users.push(formData);
          localStorage.setItem('users', JSON.stringify(users));
          alert('Successfully signed in!');
          window.opener.postMessage({ type: 'signupSuccess', user: formData }, '*');
          window.close();
        });
      </script>
    </body>
  </html>
`;

export default SignupContent;