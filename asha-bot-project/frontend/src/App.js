import React, { useState, useEffect } from 'react';
import logo from './team-logo.png';
import ChatModal from './components/ChatModal';
import dialogManager from './services/dialogManager';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [showFaqs, setShowFaqs] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);

  const faqs = [
    { question: 'What is HerKey?', answer: 'Founded in 2015 by Neha Bagaria, HerKey is India’s largest career engagement platform for women.' },
    { question: 'How to apply for jobs?', answer: 'Visit the Apply Link provided in the job listings.' },
    { question: 'What are mentorship programs?', answer: 'HerKey offers mentorship programs to support career growth for women.' },
    { question: 'Who founded HerKey?', answer: 'Neha Bagaria founded HerKey in 2015.' },
    { question: 'What is the mission of HerKey?', answer: 'To empower women in their careers through jobs and mentorship.' },
    { question: 'How can I join events?', answer: 'Register via the session links provided.' },
    { question: 'What support does HerKey offer?', answer: 'Career guidance, networking, and skill development.' },
    { question: 'Are there community events?', answer: 'Yes, check session details for upcoming events.' },
    { question: 'How to contact HerKey?', answer: 'Visit the official website for contact information.' },
    { question: 'What is women empowerment at HerKey?', answer: 'HerKey promotes leadership and growth opportunities for women.' },
  ];

  const features = [
    'List of features offered by the solution',
    'Information on mentorship programs and community events',
    'Context aware conversations without needing personal details',
    'Ethical AI guardrails to prevent gender-biased interactions',
    'Smart Session management for smooth conversational flow',
    'Dynamic retrieval of global women empowerment insights',
    'Privacy-first approach with no sensitive data collection',
    'Intelligent fallback support for unanswered queries',
    'Continuous improvement with real-time knowledge updates',
  ];

  const solutions = [
    'It will be able to solve the problem by providing personalized, trusted information through smooth conversations.',
    'Asha Bot helps users quickly find opportunities and support without feeling overwhelmed.',
  ];

  const handleSignup = () => {
    const signupWindow = window.open('', 'Signup', 'width=500,height=700');
    if (signupWindow) {
      signupWindow.document.write(`
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #6e8efb, #a777e3); margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; color: #333; }
              .signup-container { background: white; padding: 30px; max-width: 400px; border-radius: 15px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); text-align: center; }
              h2 { color: #2c3e50; margin-bottom: 10px; }
              p { color: #7f8c8d; font-size: 0.9em; margin: 10px 0; }
              .social-button, .continue-button { width: 100%; padding: 12px; margin: 10px 0; border: none; border-radius: 25px; font-size: 1em; cursor: pointer; transition: transform 0.2s; display: flex; align-items: center; justify-content: center; }
              .social-button { background: #fff; color: #2c3e50; }
              .continue-button { background: #3498db; color: white; }
              .social-button:hover, .continue-button:hover { transform: scale(1.05); }
              input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 25px; font-size: 1em; box-sizing: border-box; }
              .separator { display: flex; align-items: center; margin: 20px 0; }
              .separator p { margin: 0 10px; color: #7f8c8d; }
              .separator hr { flex: 1; border: 0; height: 1px; background: #ddd; }
              .google-icon { margin-right: 8px; font-size: 1.5em; background: linear-gradient(90deg, #4285F4, #DB4437, #F4B400, #0F9D58); -webkit-background-clip: text; color: transparent; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="signup-container">
              <h2>Ready to take the next step?</h2>
              <p>Create an account or sign in.</p>
              <p>By creating an account or signing in, you understand and agree to Indeed's Terms. You also consent to our Cookie and Privacy policies.</p>
              <button class="social-button" id="google-login"><span class="google-icon">G</span>Continue with Google</button>
              <button class="social-button">Continue with Apple</button>
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
                if (!name) { alert('Name is required!'); return; }
                let email = prompt('Please enter your Google email:');
                if (!email) { alert('Email is required!'); return; }
                fetch('http://localhost:3001/api/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password: 'google-auth' })
                }).then(res => {
                  if (!res.ok) throw new Error('Network response was not ok');
                  return res.json();
                }).then(data => {
                  if (data.message === 'Login successful!') {
                    alert('Google login successful!');
                    window.opener.postMessage({ type: 'loginSuccess', user: { name, email } }, '*');
                    window.close();
                  } else {
                    fetch('http://localhost:3001/api/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, email, phone: '', password: 'google-auth' })
                    }).then(res => {
                      if (!res.ok) throw new Error('Network response was not ok');
                      return res.json();
                    }).then(data => {
                      if (data.message === 'User registered successfully!') {
                        alert('Google registration successful, now logged in!');
                        window.opener.postMessage({ type: 'loginSuccess', user: { name, email } }, '*');
                        window.close();
                      } else {
                        alert(data.message);
                      }
                    }).catch(err => alert('Error: ' + err.message));
                  }
                }).catch(err => alert('Error: ' + err.message));
              });

              document.getElementById('signup-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = {
                  name: e.target.name.value,
                  email: e.target.email.value,
                  phone: e.target.phone.value,
                  password: e.target.password.value
                };
                fetch('http://localhost:3001/api/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData)
                }).then(res => {
                  if (!res.ok) throw new Error('Network response was not ok');
                  return res.json();
                }).then(data => {
                  if (data.message === 'User registered successfully!') {
                    alert('Successfully signed in!');
                    window.opener.postMessage({ type: 'signupSuccess', user: formData }, '*');
                    window.close();
                  } else {
                    alert(data.message);
                  }
                }).catch(err => alert('Error: ' + err.message));
              });
            </script>
          </body>
        </html>
      `);
      signupWindow.document.close();
    }
  };

  const handleLogin = () => {
    const loginWindow = window.open('', 'Login', 'width=500,height=600');
    if (loginWindow) {
      loginWindow.document.write(`
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #ff7e5f, #feb47b); margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; color: #333; }
              .login-container { background: white; padding: 30px; max-width: 400px; border-radius: 15px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); text-align: center; }
              h2 { color: #2c3e50; margin-bottom: 10px; }
              p { color: #7f8c8d; font-size: 0.9em; margin: 10px 0; }
              input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 25px; font-size: 1em; box-sizing: border-box; }
              .show-button { padding: 5px 10px; background: none; border: none; color: #3498db; cursor: pointer; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); }
              .login-button, .google-button { width: 100%; padding: 12px; margin: 10px 0; border: none; border-radius: 25px; font-size: 1em; cursor: pointer; transition: transform 0.2s; }
              .login-button { background: #3498db; color: white; }
              .google-button { background: #fff; color: #2c3e50; }
              .login-button:hover, .google-button:hover { transform: scale(1.05); }
              .forgot-password { color: #3498db; text-decoration: none; font-size: 0.9em; display: block; margin: 5px 0; }
              .separator { display: flex; align-items: center; margin: 20px 0; }
              .separator p { margin: 0 10px; color: #7f8c8d; }
              .separator hr { flex: 1; border: 0; height: 1px; background: #ddd; }
              .otp-input { display: none; }
              .otp-show { display: block; }
              .google-icon { margin-right: 8px; font-size: 1.5em; background: linear-gradient(90deg, #4285F4, #DB4437, #F4B400, #0F9D58); -webkit-background-clip: text; color: transparent; font-weight: bold; }
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
              <button class="google-button" id="google-login"><span class="google-icon">G</span>Sign in with Google</button>
            </div>
            <script>
              document.querySelectorAll('button[type="submit"]').forEach(button => {
                button.addEventListener('click', function(e) {
                  e.preventDefault();
                  let email, password, otp;
                  if (this.textContent === 'Login') {
                    email = document.querySelector('input[name="email"]').value;
                    password = document.querySelector('input[name="password"]').value;
                    fetch('http://localhost:3001/api/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, password })
                    }).then(res => {
                      if (!res.ok) throw new Error('Network response was not ok');
                      return res.json();
                    }).then(data => {
                      console.log('Login response:', data);
                      if (data.message === 'Login successful!') {
                        const userName = data.user ? data.user.name || email.split('@')[0] : email.split('@')[0];
                        alert('Login successful!');
                        window.opener.postMessage({ type: 'loginSuccess', user: { name: userName, email } }, '*');
                        window.close();
                      } else {
                        alert(data.message);
                      }
                    }).catch(err => alert('Error: ' + err.message));
                  } else if (this.id === 'otp-login') {
                    email = document.querySelector('input[name="email"]').value;
                    otp = document.querySelector('input[name="otp"]').value;
                    fetch('http://localhost:3001/api/verify-otp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, otp })
                    }).then(res => {
                      if (!res.ok) throw new Error('Network response was not ok');
                      return res.json();
                    }).then(data => {
                      if (data.message === 'OTP verified! Login successful!') {
                        const userName = email.split('@')[0];
                        alert('OTP Login successful!');
                        window.opener.postMessage({ type: 'loginSuccess', user: { name: userName, email } }, '*');
                        window.close();
                      } else {
                        alert(data.message);
                      }
                    }).catch(err => alert('Error: ' + err.message));
                  }
                });
              });

              document.getElementById('google-login').addEventListener('click', function(e) {
                e.preventDefault();
                let name = prompt('Please enter your name for Google login:');
                if (!name) { alert('Name is required!'); return; }
                let email = prompt('Please enter your Google email:');
                if (!email) { alert('Email is required!'); return; }
                fetch('http://localhost:3001/api/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password: 'google-auth' })
                }).then(res => {
                  if (!res.ok) throw new Error('Network response was not ok');
                  return res.json();
                }).then(data => {
                  if (data.message === 'Login successful!') {
                    alert('Google login successful!');
                    window.opener.postMessage({ type: 'loginSuccess', user: { name, email } }, '*');
                    window.close();
                  } else {
                    fetch('http://localhost:3001/api/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, email, phone: '', password: 'google-auth' })
                    }).then(res => {
                      if (!res.ok) throw new Error('Network response was not ok');
                      return res.json();
                    }).then(data => {
                      if (data.message === 'User registered successfully!') {
                        alert('Google registration successful, now logged in!');
                        window.opener.postMessage({ type: 'loginSuccess', user: { name, email } }, '*');
                        window.close();
                      } else {
                        alert(data.message);
                      }
                    }).catch(err => alert('Error: ' + err.message));
                  }
                }).catch(err => alert('Error: ' + err.message));
              });

              document.getElementById('otp-option').addEventListener('click', function() {
                const email = document.querySelector('input[name="email"]').value;
                fetch('http://localhost:3001/api/send-otp', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
                }).then(res => {
                  if (!res.ok) throw new Error('Network response was not ok');
                  return res.json();
                }).then(data => {
                  alert(data.message);
                }).catch(err => alert('Error: ' + err.message));
              });
            </script>
          </body>
        </html>
      `);
      loginWindow.document.close();
    }
  };

  const handleChatOpen = () => {
    setIsChatOpen(true);
    setChatMessages([{ text: `Hi ${currentUser ? currentUser.name.split(' ')[0] : 'there'}! I’m Asha, here to help with your career journey. What would you like to explore?`, sender: 'bot' }]);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      setChatMessages([...chatMessages, { text: userInput, sender: 'user' }]);
      const userId = currentUser ? currentUser.email : 'anonymous';
      const response = await dialogManager(userId, userInput);
      setUserInput('');
      setTimeout(() => {
        setChatMessages(messages => [...messages, { text: response, sender: 'bot' }]);
      }, 500);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'signupSuccess' || event.data.type === 'loginSuccess') {
        setCurrentUser(event.data.user);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div>
      <nav style={{ background: '#34495e', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="left-section">
          <img src={logo} alt="Hire Nova Logo" className="logo" style={{ height: '40px' }} />
          <a href="#home" style={{ color: 'white', textDecoration: 'none', marginLeft: '10px' }}>Hire Nova</a>
        </div>
        <div className="middle-section" style={{ position: 'relative' }}>
          <a href="#about" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>Home</a>
          <a href="#about-us" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>About Us</a>
          <span
            onClick={() => setShowFeatures(!showFeatures)}
            style={{ color: 'white', textDecoration: 'none', margin: '0 15px', cursor: 'pointer' }}
          >
            Features
          </span>
          {showFeatures && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '15px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              width: '300px',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
            }}>
              {features.map((feature, index) => (
                <p key={index} style={{ color: '#2c3e50', margin: '5px 0' }}>{feature}</p>
              ))}
            </div>
          )}
          <span
            onClick={() => setShowSolutions(!showSolutions)}
            style={{ color: 'white', textDecoration: 'none', margin: '0 15px', cursor: 'pointer' }}
          >
            Solutions
          </span>
          {showSolutions && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '15px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              width: '300px',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
            }}>
              {solutions.map((solution, index) => (
                <p key={index} style={{ color: '#2c3e50', margin: '5px 0' }}>{solution}</p>
              ))}
            </div>
          )}
          <span
            onClick={() => setShowFaqs(!showFaqs)}
            style={{ color: 'white', textDecoration: 'none', margin: '0 15px', cursor: 'pointer' }}
          >
            FAQs
          </span>
          {showFaqs && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '15px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              width: '300px',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
            }}>
              {faqs.map((faq, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                  <strong style={{ color: '#2c3e50' }}>{faq.question}</strong>
                  <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="right-section">
          {currentUser ? (
            <div className="user-icon" style={{ 
              width: '40px', 
              height: '40px', 
              background: '#e74c3c', 
              color: 'white', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '20px', 
              cursor: 'pointer',
              marginLeft: '15px'
            }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <>
              <a href="#signup" onClick={handleSignup} style={{ color: 'white', textDecoration: 'none', marginLeft: '15px' }}>Sign Up</a>
              <a href="#login" onClick={handleLogin} style={{ color: 'white', textDecoration: 'none', marginLeft: '15px' }}>Login</a>
            </>
          )}
        </div>
      </nav>
      <div className="content" style={{ textAlign: 'center', padding: '50px 20px' }}>
        <h1 style={{ 
          position: 'relative', 
          display: 'inline-block', 
          color: '#2c3e50', 
          fontSize: '2.5em',
          marginBottom: '10px'
        }}>
          {currentUser ? (
            <>
              Welcome to Asha AI Bot by Hire Nova
              <span style={{
                background: 'linear-gradient(45deg, #e74c3c, #e67e22)',
                color: 'white',
                padding: '5px 15px',
                borderRadius: '20px',
                marginLeft: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                display: 'inline-block'
              }}>
                Hi, {currentUser.name.split(' ')[0]}!
              </span>
            </>
          ) : (
            'Welcome to Asha AI Bot by Hire Nova'
          )}
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '1.1em' }}>Empowering women in their career journey with personalized job insights, mentorship, and community events.</p>
        <button onClick={handleChatOpen} className="cta-button" style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', borderRadius: '25px', border: 'none', cursor: 'pointer' }}>Try Asha Bot</button>
      </div>
      <div className="footer" style={{ background: '#e0f0ff', padding: '30px', textAlign: 'center' }}>
        <p>© 2025 JobsForHer Foundation | Built for Asha AI Hackathon by Hire Nova</p>
      </div>
      <div className="chat-bot-icon" onClick={handleChatOpen} style={{ position: 'fixed', bottom: '20px', right: '20px', width: '50px', height: '50px', background: '#e74c3c', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', cursor: 'pointer' }}>
        💬
      </div>
      <ChatModal
        isOpen={isChatOpen}
        onClose={handleChatClose}
        messages={chatMessages}
        userInput={userInput}
        setUserInput={setUserInput}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

export default App;