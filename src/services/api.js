const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getAuthHeader() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch all prompts from server
 */
export async function fetchPrompts() {
  try {
    const response = await fetch(`${API_URL}/api/prompts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch prompts');
    }

    const data = await response.json();
    return data.prompts || [];
  } catch (error) {
    console.error('Error fetching prompts:', error);
    throw error;
  }
}

/**
 * Create a new prompt
 */
export async function createPromptAPI(prompt) {
  try {
    const response = await fetch(`${API_URL}/api/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(prompt),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create prompt');
    }

    const data = await response.json();
    return data.prompt;
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
}

/**
 * Update an existing prompt
 */
export async function updatePromptAPI(id, prompt) {
  try {
    const response = await fetch(`${API_URL}/api/prompts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ id, ...prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update prompt');
    }

    const data = await response.json();
    return data.prompt;
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
}

/**
 * Delete a prompt
 */
export async function deletePromptAPI(id) {
  try {
    const response = await fetch(`${API_URL}/api/prompts`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete prompt');
    }

    return true;
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw error;
  }
}

/**
 * Import prompts from JSON
 */
export async function importPromptsAPI(prompts) {
  try {
    const response = await fetch(`${API_URL}/api/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        action: 'import',
        prompts,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to import prompts');
    }

    const data = await response.json();
    return data.prompts || [];
  } catch (error) {
    console.error('Error importing prompts:', error);
    throw error;
  }
}
