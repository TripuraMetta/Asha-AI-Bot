import { classifyIntent } from './nlp';
import { loadSessionDetails, updateSessionDetails, searchJobs } from './dataService';

const dialogManager = async (userId, message) => {
  const session = await loadSessionDetails(userId);
  const intent = classifyIntent(message.toLowerCase());
  let response = '';

  console.log(`Dialog Manager - Intent: ${intent}, Message: ${message}, Session:`, session); // Debug log

  switch (intent) {
    case 'job':
      session.preferences = session.preferences || {};
      response = "Great! I can help with job searches. Please tell me your preferences (e.g., role, location).";
      break;
    case 'event':
      response = "Awesome! Let me find some community events for you. Check back soon for updates!";
      break;
    case 'mentorship':
      response = "Fantastic! I can guide you to mentorship programs. Would you like details?";
      break;
    case 'greeting':
      response = "Hello! How can Asha assist you today?";
      break;
    default:
      response = "I’m not sure how to help with that yet. Try 'job search', 'event info', or 'mentorship'!";
  }

  // Handle follow-up for job intent
  if (intent === 'job' && message.toLowerCase().includes('role')) {
    session.preferences.role = message.split('role')[1]?.trim() || '';
    response = `Got it! You’re interested in a ${session.preferences.role} role. What location do you prefer?`;
  } else if (intent === 'job' && message.toLowerCase().includes('location')) {
    session.preferences.location = message.split('location')[1]?.trim() || '';
    const jobs = await searchJobs(session.preferences);
    if (jobs.length > 0) {
      response = `I found ${jobs.length} job(s) matching your preferences:\n`;
      jobs.forEach(job => {
        response += `- ${job.title} at ${job.company} in ${job.location}: ${job.description}\n`;
      });
    } else {
      response = `Sorry, I couldn’t find any jobs matching your preferences (${session.preferences.role} in ${session.preferences.location}). Try different preferences!`;
    }
  }

  session.history.push({ message, response, timestamp: new Date().toISOString() });
  await updateSessionDetails(userId, session);

  return response;
};

export default dialogManager;