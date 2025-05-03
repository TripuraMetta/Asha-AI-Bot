# db.py
import sqlite3
import json
import os
from datetime import datetime

def init_db():
    conn = sqlite3.connect("user_data.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            created_at TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            email TEXT,
            query TEXT,
            response TEXT,
            timestamp TEXT,
            FOREIGN KEY (email) REFERENCES users (email)
        )
    """)
    conn.commit()
    conn.close()

def load_session_data():
    if not os.path.exists("Session_details.json"):
        print("Session_details.json not found.")
        return
    try:
        with open("Session_details.json", "r") as f:
            data = json.load(f)
        conn = sqlite3.connect("user_data.db")
        cursor = conn.cursor()
        for entry in data:
            name = entry.get("name", "Anonymous")
            email = entry.get("email", "anonymous@example.com")
            query = entry.get("query", "")
            response = entry.get("response", "")
            session_id = entry.get("session_id", "")
            timestamp = entry.get("timestamp", datetime.now().isoformat())
            cursor.execute(
                "INSERT OR IGNORE INTO users (name, email, created_at) VALUES (?, ?, ?)",
                (name, email, timestamp)
            )
            cursor.execute(
                "INSERT INTO sessions (session_id, email, query, response, timestamp) VALUES (?, ?, ?, ?, ?)",
                (session_id, email, query, response, timestamp)
            )
        conn.commit()
        conn.close()
        print("Session data loaded into database.")
    except json.JSONDecodeError as e:
        print(f"Error parsing Session_details.json: {e}")
    except Exception as e:
        print(f"Error loading session data: {e}")

def save_user_data(name, email, query):
    conn = sqlite3.connect("user_data.db")
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    cursor.execute(
        "INSERT OR IGNORE INTO users (name, email, created_at) VALUES (?, ?, ?)",
        (name, email, timestamp)
    )
    conn.commit()
    conn.close()

def save_session_data(session_id, email, query, response):
    conn = sqlite3.connect("user_data.db")
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    cursor.execute(
        "INSERT INTO sessions (session_id, email, query, response, timestamp) VALUES (?, ?, ?, ?, ?)",
        (session_id, email, query, response, timestamp)
    )
    conn.commit()
    conn.close()

def get_session_data(session_id):
    conn = sqlite3.connect("user_data.db")
    cursor = conn.cursor()
    cursor.execute("SELECT query, response FROM sessions WHERE session_id = ?", (session_id,))
    rows = cursor.fetchall()
    conn.close()
    return "\n".join([f"User: {row[0]}\nBot: {row[1]}" for row in rows]) if rows else ""

def get_user_history(email):
    conn = sqlite3.connect("user_data.db")
    cursor = conn.cursor()
    cursor.execute("SELECT query, timestamp FROM sessions WHERE email = ? ORDER BY timestamp DESC", (email,))
    rows = cursor.fetchall()
    conn.close()
    return [(row[0], row[1]) for row in rows]

if __name__ == "__main__":
    init_db()
    load_session_data()