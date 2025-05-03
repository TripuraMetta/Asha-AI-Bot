# test_nltk_data.py
import nltk
import os
nltk.data.path.append(os.path.expanduser("~/nltk_data"))
print(nltk.data.find("tokenizers/punkt"))