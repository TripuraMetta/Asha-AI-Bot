import os
import gradio as gr
import pandas as pd
import json
import uuid
from cryptography.fernet import Fernet

# Generate and load encryption key
if not os.path.exists("secret.key"):
    key = Fernet.generate_key()
    with open("secret.key", "wb") as key_file:
        key_file.write(key)
with open("secret.key", "rb") as key_file:
    key = key_file.read()
cipher = Fernet(key)

# User Management
def load_users():
    if os.path.exists("users.json"):
        try:
            with open("users.json", "rb") as f:
                encrypted_data = f.read()
            decrypted_data = cipher.decrypt(encrypted_data)
            return json.loads(decrypted_data.decode())
        except Exception as e:
            print(f"Error loading users: {str(e)}")
            return {}
    return {}

def save_users(users):
    try:
        data = json.dumps(users).encode()
        encrypted_data = cipher.encrypt(data)
        with open("users.json", "wb") as f:
            f.write(encrypted_data)
    except Exception as e:
        print(f"Error saving users: {str(e)}")

# Intent Detection
def detect_intent(query):
    query_lower = query.lower()
    if "job" in query_lower and ("role" in query_lower or "location" in query_lower):
        role = None
        location = None
        words = query_lower.split()
        for i, word in enumerate(words):
            if word == "role" and i + 1 < len(words):
                role = words[i + 1]
            if word == "location" and i + 1 < len(words):
                location = words[i + 1]
        return "job_search", {"role": role, "location": location}
    if "session" in query_lower or "event" in query_lower:
        return "session_details", {}
    if "what" in query_lower or "how" in query_lower:
        return "faq_query", {}
    return None, {}

# Data Query Functions
def search_jobs(role, location):
    try:
        if not os.path.exists("job_listings.csv"):
            return "Error: job_listings.csv file not found."
        df = pd.read_csv("job_listings.csv")
        required_columns = ["Job ID", "Job Title", "Company", "Location", "Job Type", "Apply Link"]
        if not all(col in df.columns for col in required_columns):
            return f"Error: job_listings.csv is missing required columns. Expected: {required_columns}"
        query = df[required_columns]
        if role:
            query = query[query['Job Title'].str.contains(role, case=False, na=False)]
        if location:
            query = query[query['Location'].str.contains(location, case=False, na=False)]
        return query.head(3).to_string(index=False) if not query.empty else "No jobs found."
    except Exception as e:
        return f"Error searching jobs: {str(e)}"

def get_session_details(query):
    try:
        if not os.path.exists("Session_details.json"):
            return "Error: Session_details.json file not found."
        with open("Session_details.json", "r") as f:
            sessions = json.load(f)
        required_fields = ["title", "date", "time", "location", "registration_link", "description"]
        for session in sessions:
            if not all(field in session for field in required_fields):
                return f"Error: Session_details.json entries are missing required fields. Expected: {required_fields}"
        query_lower = query.lower()
        relevant_sessions = []
        for session in sessions:
            if any(keyword in query_lower for keyword in [session["title"].lower(), session["description"].lower()]):
                relevant_sessions.append(
                    f"Session: {session['title']}\n"
                    f"Date: {session['date']} {session['time']}\n"
                    f"Location: {session['location']}\n"
                    f"Link: {session['registration_link']}\n"
                    f"Description: {session['description']}"
                )
        return "\n\n".join(relevant_sessions) if relevant_sessions else "No session details found."
    except Exception as e:
        return f"Error retrieving session details: {str(e)}"

def search_faq(query):
    try:
        if not os.path.exists("docs/faqs.txt"):
            return "Error: docs/faqs.txt file not found."
        with open("docs/faqs.txt", "r") as f:
            lines = f.readlines()
        query_lower = query.lower()
        for line in lines:
            if line.strip():
                question, answer = line.split("?", 1)
                if query_lower in question.lower():
                    return answer.strip()
        return None
    except Exception as e:
        return f"Error reading faqs.txt: {str(e)}"

# Chatbot Response Logic
def chatbot_response(username, query, session_id=None):
    session_id = session_id or str(uuid.uuid4())
    users = load_users()
    if username not in users:
        return "Error: User not found. Please log in again.", session_id, []

    # Initialize chat history
    if "chats" not in users[username]:
        users[username]["chats"] = []
    users[username]["chats"].append({"id": session_id, "query": query, "response": ""})
    save_users(users)

    query_lower = query.lower()
    response = ""

    # Content Moderation
    moderation_keywords = ["hate", "abuse", "violence", "discrimination"]
    if any(keyword in query_lower for keyword in moderation_keywords):
        response = "Sorry, this content is not appropriate. Please ask something else."
    else:
        # Bias Detection
        biased_keywords = ["suitable", "better", "good at", "capable", "should", "can", "are", "not good", "not suited", "only men"]
        is_biased = any(keyword in query_lower for keyword in biased_keywords) and ("women" in query_lower or "female" in query_lower)

        if is_biased:
            if "leadership" in query_lower or "roles" in query_lower:
                response = "Let’s celebrate inclusivity! Women like Neha Bagaria, who founded HerKey, have led transformative changes. Want to explore leadership opportunities or success stories?"
            elif "tech" in query_lower or "engineering" in query_lower or "jobs" in query_lower:
                response = "Empowerment is key! Women excel in tech and engineering—check out job openings or mentorship programs to see how!"
            elif "teaching" in query_lower or "education" in query_lower:
                response = "Diversity shines in education! Women have shaped teaching globally—would you like to learn about career support or inspiring educators?"
            else:
                response = "Let’s focus on empowerment! Women have achieved remarkable success across industries. Explore job opportunities, mentorship, or women’s leadership stories?"
        else:
            # Basic Responses
            if not query.strip():
                response = f"Hi {username}! Please ask something."
            elif "thank" in query_lower or "thanks" in query_lower:
                response = f"You're welcome, {username}! Anything else I can help with?"
            elif "bye" in query_lower or "goodbye" in query_lower:
                response = f"Goodbye, {username}! Come back if you need help."
            elif "hi" in query_lower or "hello" in query_lower:
                response = f"Hi {username}! How can I help you?"
            else:
                # Intent-Based Responses
                intent, params = detect_intent(query)
                if intent == "job_search":
                    role = params.get("role")
                    location = params.get("location")
                    if role or location:
                        response = search_jobs(role, location)
                    else:
                        response = "Please specify a role (e.g., developer) and/or location (e.g., Bangalore) for job search."
                elif intent == "session_details":
                    response = get_session_details(query)
                elif intent == "faq_query":
                    faq_response = search_faq(query)
                    response = faq_response if faq_response else "I couldn’t find an answer for that. Please try a different question or check the FAQs."
                else:
                    response = "I don’t understand. Please ask about jobs, sessions, or use specific questions like 'What is HerKey?'"

    # Update chat history with response
    for chat in users[username]["chats"]:
        if chat["id"] == session_id:
            chat["response"] = response
    save_users(users)

    chat_history = users[username]["chats"]
    return response, session_id, chat_history

# Gradio Interface
def create_interface():
    with gr.Blocks(title="HerKEY Chatbot") as iface:
        # Login/Signup Page
        with gr.Row(visible=True) as login_page:
            gr.Markdown("# HerKEY Chatbot")
            gr.Markdown("## Get answers. Find inspiration. Be more productive.")
            gr.Markdown("Free to use. Easy to try. Just ask and HerKEY can help with jobs, mentorship, and more.")
            username = gr.Textbox(label="Username", placeholder="Enter username")
            password = gr.Textbox(label="Password", type="password", placeholder="Enter password")
            signup_btn = gr.Button("Sign Up", visible=True)
            login_btn = gr.Button("Login", visible=True)
            message = gr.Markdown(label="Message")
            logged_in = gr.State(False)
            current_user = gr.State(None)

        # Chat Interface
        with gr.Row(visible=False) as chat_interface:
            with gr.Column(scale=2, min_width=200) as sidebar:
                gr.Markdown("### History")
                chat_history = gr.State([])
                chat_list = gr.HTML(value="", label="Chats")
                def update_history(history):
                    html = "<ul>" + "".join(f"<li>{chat['query'][:20]}...</li>" for chat in history) + "</ul>"
                    return html
                chat_history.change(fn=update_history, inputs=[chat_history], outputs=[chat_list])

            with gr.Column(scale=8):
                user_icon = gr.Markdown(visible=False)
                greeting = gr.Markdown(visible=False)
                with gr.Row():
                    ask_box = gr.Textbox(label="Ask anything", placeholder="Type your question here...", show_label=False, container=False)
                    arrow_button = gr.Button("➡️", elem_classes="arrow-button")
                output = gr.Textbox(label="Response")
                session_id = gr.State()

                css = """
                .arrow-button {
                    background-color: #10a37f;
                    color: white;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    padding: 0;
                }
                """

                def login(username_input, password_input):
                    if not username_input or not password_input:
                        return gr.update(visible=True), gr.update(visible=False), gr.update(visible=False), gr.update(visible=False), None, gr.update(value="Username and password cannot be empty.")
                    users = load_users()
                    if username_input in users and users[username_input]["password"] == password_input:
                        icon = f"<div style='background-color: #10a37f; color: white; width: 40px; height: 40px; border-radius: 50%; text-align: center; line-height: 40px;'>{username_input[0].upper()}</div>"
                        return gr.update(visible=False), gr.update(visible=True), gr.update(value=icon, visible=True), gr.update(value=f"### What’s up, {username_input}!", visible=True), username_input, True
                    return gr.update(visible=True), gr.update(visible=False), gr.update(visible=False), gr.update(visible=False), None, gr.update(value="Invalid username or password.")

                def signup(username_input, password_input):
                    if not username_input or not password_input:
                        return gr.update(value="Username and password cannot be empty."), None, None
                    users = load_users()
                    if username_input in users:
                        return gr.update(value="Username already exists!"), None, None
                    users[username_input] = {"password": password_input, "chats": []}
                    save_users(users)
                    return gr.update(value="Sign up successful! Please log in."), username_input, password_input

                signup_btn.click(
                    fn=signup,
                    inputs=[username, password],
                    outputs=[message, username, password]
                )
                login_btn.click(
                    fn=login,
                    inputs=[username, password],
                    outputs=[login_page, chat_interface, user_icon, greeting, current_user, logged_in]
                )
                # Submit on Arrow Button or Enter
                for event in [arrow_button.click, ask_box.submit]:
                    event(
                        fn=chatbot_response,
                        inputs=[current_user, ask_box, session_id],
                        outputs=[output, session_id, chat_history]
                    )

    return iface

if __name__ == "__main__":
    iface = create_interface()
    iface.launch()
