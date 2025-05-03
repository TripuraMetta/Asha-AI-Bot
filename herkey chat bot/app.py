# app.py
import os
import gradio as gr
from dotenv import load_dotenv
from db import save_user_data, save_session_data, get_session_data
from nlp import detect_intent
from monitor import log_interaction
from knowledge_base import setup_knowledge_base, query_knowledge_base
from tavily import TavilyClient
import pandas as pd
import json
import uuid
import sys
import subprocess
import os

from langchain_community.document_loaders import UnstructuredFileLoader
from cryptography.fernet import Fernet


if 'DETACHED_PROCESS' not in os.environ:
    # Relaunch the script in a detached process
    subprocess.Popen(
        [sys.executable, __file__],
        env={**os.environ, 'DETACHED_PROCESS': '1'},
        creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    sys.exit(0)  # Exit the current process

# Generate and load encryption key
if not os.path.exists("secret.key"):
    key = Fernet.generate_key()
    with open("secret.key", "wb") as key_file:
        key_file.write(key)
with open("secret.key", "rb") as key_file:
    key = key_file.read()
cipher = Fernet(key)

def load_users():
    if os.path.exists("users.json"):
        with open("users.json", "rb") as f:
            encrypted_data = f.read()
        decrypted_data = cipher.decrypt(encrypted_data)
        return json.loads(decrypted_data.decode())
    return {}

def save_users(users):
    data = json.dumps(users).encode()
    encrypted_data = cipher.encrypt(data)
    with open("users.json", "wb") as f:
        f.write(encrypted_data)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
vectorstore = setup_knowledge_base()  # Cached globally
tavily_client = TavilyClient(api_key=TAVILY_API_KEY)

USERS_FILE = "users.json"

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f)

def search_jobs(role, location):
    try:
        df = pd.read_csv("job_listings.csv")
        query = df[["Job ID", "Job Title", "Company", "Location", "Job Type", "Apply Link"]]
        if role:
            query = query[query['Job Title'].str.contains(role, case=False, na=False)]
        if location:
            query = query[query['Location'].str.contains(location, case=False, na=False)]
        return query.head(3).to_string(index=False) if not query.empty else "No jobs found."
    except Exception as e:
        return f"Error searching jobs: {str(e)}"

def get_session_history(query):
    try:
        with open("Session_details.json", "r") as f:
            sessions = json.load(f)
        query_lower = query.lower()
        relevant_sessions = []
        for session in sessions:
            if any(keyword in query_lower for keyword in [session["title"].lower(), session["description"].lower()]):
                relevant_sessions.append(f"Session: {session['title']}\nDate: {session['date']} {session['time']}\nLocation: {session['location']}\nLink: {session['registration_link']}\nDescription: {session['description']}")
        return "\n\n".join(relevant_sessions) if relevant_sessions else "No session details found."
    except Exception as e:
        return f"Error retrieving session history: {str(e)}"

def process_uploaded_file(file_path):
    try:
        loader = UnstructuredFileLoader(file_path)
        docs = loader.load()
        return "\n".join([doc.page_content for doc in docs]) if docs else "No content extracted from the file."
    except Exception as e:
        return f"Error processing file: {str(e)}"

def direct_faq_search(query):
    try:
        with open("docs/faqs.txt", "r") as f:
            lines = f.readlines()
        query_lower = query.lower()
        for line in lines:
            if line.strip():
                question, answer = line.split("?", 1)
                if query_lower in question.lower():
                    print(f"Direct match found: Query: {query}, Answer: {answer.strip()}")
                    return answer.strip()
        print(f"No direct match found in faqs.txt for: {query}")
        return None
    except Exception as e:
        print(f"Error reading faqs.txt: {str(e)}")
        return None

# app.py (replace the chatbot_response function)
# app.py (replace the chatbot_response function)
def chatbot_response(username, query, uploaded_file, session_id=None):
    session_id = session_id or str(uuid.uuid4())
    email = f"{username}@example.com"
    sanitized_query = query.strip()[:1000]
    save_user_data(username, email, sanitized_query)
    users = load_users()
    users[username]["chats"].append({"id": session_id, "query": sanitized_query, "response": ""})
    save_users(users)

    # Content moderation check
    moderation_keywords = ["hate", "abuse", "violence", "discrimination"]
    if any(keyword in sanitized_query.lower() for keyword in moderation_keywords):
        response = "Sorry, this content is not appropriate. Please ask something else."
    else:
        file_response = process_uploaded_file(uploaded_file.name) if uploaded_file else ""

        query_lower = sanitized_query.lower()

        # Bias detection with varied responses
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
            intent, params = detect_intent(sanitized_query)
            if not query.strip() and not uploaded_file:
                response = f"Hi {username}! Please ask something or upload a file."
            elif "thank" in query_lower or "thanks" in query_lower:
                response = f"You're welcome, {username}! Anything else I can help with?"
            elif "bye" in query_lower or "goodbye" in query_lower:
                response = f"Bye, {username}! Come back if you need help."
            elif "hi" in query_lower or "hello" in query_lower:
                response = f"Hi {username}! How can I help you?"
            elif intent == "job_search":
                role = params.get("role")
                location = params.get("location")
                if role or location:
                    response = search_jobs(role, location)
                else:
                    response = "Please specify a role (e.g., developer) and/or location (e.g., Bangalore) for job search."
            elif intent == "internet_search":
                try:
                    results = tavily_client.search(params.get("query", sanitized_query))
                    response = "\n".join([r["content"][:200] for r in results["results"][:3]])
                except Exception as e:
                    response = f"Internet search error: {str(e)}"
            elif intent == "session_details":
                response = get_session_history(sanitized_query)
            elif intent == "faq_query":
                response = direct_faq_search(sanitized_query)
                if not response:
                    response = "I couldn’t find an answer for that. Please try a different question or check the FAQs."
            elif "women empowerment" in query_lower or "women career" in query_lower:
                try:
                    results = tavily_client.search("global women empowerment initiatives")
                    response = "Here are some insights on women empowerment:\n" + "\n".join([r["content"][:200] for r in results["results"][:2]])
                except Exception as e:
                    response = f"Error fetching women empowerment insights: {str(e)}"
            else:
                response = "I don’t understand. Please ask about jobs, sessions, or use specific questions like 'What is HerKey?'"

    response = f"{file_response}\n{response}" if file_response else response
    for chat in users[username]["chats"]:
        if chat["id"] == session_id:
            chat["response"] = response
    save_users(users)
    save_session_data(session_id, email, sanitized_query, response)
    log_interaction(email, sanitized_query, response)
    return response, session_id


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

        # Main Chat Interface
        with gr.Row(visible=False) as chat_interface:
            with gr.Column(scale=2, min_width=200) as sidebar:
                gr.Markdown("### History")
                chat_history = gr.State([])
                chat_list = gr.components.HTML(value="", label="Chats")
                def update_history(username):
                    users = load_users()
                    chats = users.get(username, {}).get("chats", [])
                    html = "<ul>" + "".join(f"<li>{c['query'][:20]}...</li>" for c in chats) + "</ul>"
                    return gr.update(value=html)
                current_user.change(fn=update_history, inputs=[current_user], outputs=[chat_list])

            with gr.Column(scale=8):
                user_icon = gr.Markdown(visible=False)
                greeting = gr.Markdown(visible=False)
                with gr.Row():
                    ask_box = gr.Textbox(label="Ask anything", placeholder="Type your question here...", show_label=False, container=False)
                    # Arrow button for submission
                    arrow_button = gr.Button("➡️", elem_classes="arrow-button")
                with gr.Row():
                    file_upload = gr.UploadButton("📄", file_types=[".txt", ".pdf", ".docx"])
                    # Placeholder for search and voice (not implemented yet)
                    gr.Button("🌐", elem_classes="small-button")
                    gr.Button("🎙️", elem_classes="small-button")
                output = gr.Textbox(label="Response")
                session_id = gr.State()

                # CSS to style the arrow button
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
                .small-button {
                    background-color: #f0f0f0;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    padding: 0;
                    margin-left: 5px;
                }
                """

                def login(username_input, password_input):
                    users = load_users()
                    if username_input in users and users[username_input]["password"] == password_input:
                        icon = f"<div style='background-color: #10a37f; color: white; width: 40px; height: 40px; border-radius: 50%; text-align: center; line-height: 40px;'>{username_input[0].upper()}</div>"
                        return gr.update(visible=False), gr.update(visible=True), gr.update(value=icon, visible=True), gr.update(value=f"### What’s up, {username_input}!", visible=True), username_input, True
                    return gr.update(visible=True), gr.update(visible=False), gr.update(visible=False), gr.update(visible=False), None, gr.update(value="Invalid username or password.")

                def signup(username_input, password_input):
                    users = load_users()
                    if username_input not in users:
                        users[username_input] = {"password": password_input, "chats": []}
                        save_users(users)
                        return gr.update(value="Sign up successful! Please log in."), username_input, password_input
                    return gr.update(value="Username already exists!"), None, None

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
                # Submit on Arrow Button click
                arrow_button.click(
                    fn=chatbot_response,
                    inputs=[current_user, ask_box, file_upload, session_id],
                    outputs=[output, session_id]
                ).then(
                    fn=lambda x: gr.update(value=""),  # Clear file upload
                    inputs=[file_upload],
                    outputs=[file_upload]
                ).then(
                    fn=update_history,
                    inputs=[current_user],
                    outputs=[chat_list]
                )
                # Submit on Enter key
                ask_box.submit(
                    fn=chatbot_response,
                    inputs=[current_user, ask_box, file_upload, session_id],
                    outputs=[output, session_id]
                ).then(
                    fn=lambda x: gr.update(value=""),  # Clear file upload
                    inputs=[file_upload],
                    outputs=[file_upload]
                ).then(
                    fn=update_history,
                    inputs=[current_user],
                    outputs=[chat_list]
                )

    return iface

if __name__ == "__main__":
    iface = create_interface()
    # Launch and capture the URLs
    with open("gradio_url.txt", "w") as f:
        # Redirect Gradio output to the file
        import sys
        original_stdout = sys.stdout
        sys.stdout = f
        iface.launch(server_port=7860, share=True)
        sys.stdout = original_stdout