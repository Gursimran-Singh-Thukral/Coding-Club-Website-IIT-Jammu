// src/api/profile.js

const BASE_URL = "/api/profile";

/**
 * GET /api/profile
 */
export const getAllProfiles = async () => {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch profiles");
  }

  return response.json();
};

/**
 * PUT /api/profile/me
 */
export const updateProfile = async (profileData, token) => {
  const response = await fetch(`${BASE_URL}/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
};
