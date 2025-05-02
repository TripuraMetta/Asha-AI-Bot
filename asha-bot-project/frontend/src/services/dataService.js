import Papa from 'papaparse';

export const loadSessionDetails = async (userId) => {
  try {
    const response = await fetch('/data/sessiondetails.json');
    const data = await response.json();
    return data.sessions[userId] || { preferences: { role: '', location: '' }, history: [], timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Error loading session details:', error);
    return { preferences: { role: '', location: '' }, history: [], timestamp: new Date().toISOString() };
  }
};

export const updateSessionDetails = async (userId, sessionData) => {
  try {
    const currentData = await loadSessionDetails(userId);
    const updatedData = {
      ...currentData,
      preferences: { ...currentData.preferences, ...sessionData.preferences },
      history: [...currentData.history, ...sessionData.history],
      timestamp: new Date().toISOString()
    };
    console.log(`Simulated saving session for ${userId}:`, updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error updating session details:', error);
    return sessionData;
  }
};

export const loadJobListings = async () => {
  try {
    const response = await fetch('/data/job_listings.csv');
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => resolve(result.data),
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error loading job listings:', error);
    return [];
  }
};

export const searchJobs = async (preferences) => {
  const jobs = await loadJobListings();
  console.log('Loaded jobs:', jobs); // Debug log
  return jobs.filter(job => {
    const matchesRole = preferences.role ? job.title.toLowerCase().includes(preferences.role.toLowerCase()) : true;
    const matchesLocation = preferences.location ? job.location.toLowerCase().includes(preferences.location.toLowerCase()) : true;
    return matchesRole && matchesLocation;
  });
};