const DAIANA_URL = process.env.DAIANA_URL || 'http://localhost:3000';

export const fetchMessages = async () => {
  const response = await fetch(`${DAIANA_URL}/api/messages`);
  return response.json();
}; 