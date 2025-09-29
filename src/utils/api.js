// Use the environment variable from Vercel, with a fallback for local testing
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://seven-golden-cowries-backend.onrender.com';

/**
 * Fetches the complete user profile from the backend.
 * @param {string} walletAddress The user's TON wallet address.
 * @returns {Promise<object>} The user data (e.g., { xp, level, ... }).
 */
export const fetchUserProfile = async (walletAddress) => {
    // This endpoint must exist on your backend.
    // GET /api/v1/profile/:walletAddress
    const response = await fetch(`${API_BASE_URL}/api/v1/profile/${walletAddress}`);

    if (!response.ok) {
        // If the user doesn't exist yet, the backend might return a 404.
        // The backend should create a new user profile on the first connection.
        console.error(`Error fetching profile for ${walletAddress}: ${response.statusText}`);
        throw new Error('Failed to fetch or create user profile.');
    }

    return response.json();
};

// We will add more functions here later (e.g., fetchQuests, submitProof, etc.)
