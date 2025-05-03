# nlp.py
def detect_intent(query):
    query = query.lower()
    params = {}
    if "job" in query or "jobs" in query or "find" in query:
        intent = "job_search"
        for word in query.split():
            if any(role in word for role in ["engineer", "developer", "analyst", "architect"]):
                params["role"] = word
            if any(loc in word for loc in ["bangalore", "hyderabad", "bennettfort", "audreyfort"]):
                params["location"] = word
    elif "search" in query and not ("job" in query or "jobs" in query):
        intent = "internet_search"
        params["query"] = query
    elif "session" in query or "details" in query:
        intent = "session_details"
    elif any(q in query for q in ["what", "how", "who", "are there", "what is"]):
        intent = "faq_query"
        # Enhanced bias detection
        biased_keywords = ["suitable", "better", "good at", "capable", "should", "can women", "are women", "women good", "women better", "women capable", "not good", "not suited", "only men"]
        params["is_biased"] = any(keyword in query for keyword in biased_keywords) and ("women" in query or "female" in query)
    else:
        intent = "general"
    return intent, params