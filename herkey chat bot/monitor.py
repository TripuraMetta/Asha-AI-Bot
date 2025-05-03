# monitor.py
import os
import csv
from datetime import datetime

def log_interaction(email, query, response):
    log_file = "interaction_log.csv"
    file_exists = os.path.isfile(log_file)
    with open(log_file, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['timestamp', 'email', 'query', 'response'])
        writer.writerow([datetime.now().isoformat(), email, query, response])