// src/api/user.js

const BASE_URL = "/api/users";

/**
 * GET /api/users/profile
 */
export const getUserProfile = async (token) => {
  const response = await fetch(`${BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return response.json();
};
