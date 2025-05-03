# test_db.py
import sqlite3
conn = sqlite3.connect("user_data.db")
cursor = conn.cursor()
cursor.execute("SELECT * FROM users LIMIT 5")
print("Users:", cursor.fetchall())
cursor.execute("SELECT * FROM sessions LIMIT 5")
print("Sessions:", cursor.fetchall())
conn.close()