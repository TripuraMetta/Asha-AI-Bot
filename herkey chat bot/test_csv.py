# test_csv.py
import pandas as pd
try:
    df = pd.read_csv("job_listings.csv")
    print(df.head())
except Exception as e:
    print(f"Error reading job_listings.csv: {e}")