import natural from 'natural';

const classifier = new natural.BayesClassifier();

// Add more examples for each intent to improve recognition
classifier.addDocument('job search', 'job');
classifier.addDocument('find job', 'job');
classifier.addDocument('looking for job', 'job');
classifier.addDocument('search jobs', 'job');
classifier.addDocument('job opportunity', 'job');
classifier.addDocument('need a job', 'job');
classifier.addDocument('job openings', 'job');
classifier.addDocument('event info', 'event');
classifier.addDocument('events', 'event');
classifier.addDocument('find events', 'event');
classifier.addDocument('community events', 'event');
classifier.addDocument('what events', 'event');
classifier.addDocument('upcoming events', 'event');
classifier.addDocument('event details', 'event');
classifier.addDocument('mentorship', 'mentorship');
classifier.addDocument('mentor program', 'mentorship');
classifier.addDocument('find mentor', 'mentorship');
classifier.addDocument('mentorship program', 'mentorship');
classifier.addDocument('guidance', 'mentorship');
classifier.addDocument('career guidance', 'mentorship');
classifier.addDocument('mentor support', 'mentorship');
classifier.addDocument('hello', 'greeting');
classifier.addDocument('hi', 'greeting');
classifier.addDocument('hey', 'greeting');
classifier.addDocument('greetings', 'greeting');
classifier.addDocument('howdy', 'greeting');
classifier.addDocument('good morning', 'greeting');
classifier.addDocument('test', 'default');
classifier.addDocument('random', 'default');
classifier.addDocument('blah', 'default');
classifier.addDocument('xyz', 'default');
classifier.addDocument('unknown', 'default');
classifier.addDocument('something else', 'default');
classifier.addDocument('jobs', 'job');


classifier.addDocument('role software engineer', 'job');
classifier.addDocument('role data analyst', 'job');
classifier.addDocument('role product manager', 'job');
classifier.addDocument('location bangalore', 'job');
classifier.addDocument('location hyderabad', 'job');
classifier.addDocument('location remote', 'job');

classifier.train();

export const classifyIntent = (text) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('job') || lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('role') || lowerText.includes('location')) return 'job';
  if (lowerText.includes('event') || lowerText.includes('events')) return 'event';
  if (lowerText.includes('mentorship') || lowerText.includes('mentor')) return 'mentorship';
  if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) return 'greeting';
  return 'default';
};