// This service now communicates with the Netlify Function backend
// instead of calling Google Gemini API directly from the browser.

export const routeUserRequest = async (userPrompt: string): Promise<any> => {
  try {
    // Call the Netlify Function (The Proxy)
    // Ensure you are running this in a Netlify environment or using `netlify dev` locally
    const response = await fetch('/.netlify/functions/gemini-router', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt })
    });

    if (!response.ok) {
      throw new Error(`Netlify Function Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error routing request via backend:', error);
    throw error;
  }
};