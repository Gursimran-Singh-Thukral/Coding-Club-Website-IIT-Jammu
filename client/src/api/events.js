// src/api/events.js

const BASE_URL = "/api/events";

/**
 * GET /api/events
 */
export const getEvents = async () => {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  return response.json();
};

/**
 * POST /api/events
 */
export const createEvent = async (eventData, token) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error("Failed to create event");
  }

  return response.json();
};

/**
 * PUT /api/events/:id
 */
export const updateEvent = async (id, eventData, token) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error("Failed to update event");
  }

  return response.json();
};

/**
 * DELETE /api/events/:id
 */
export const deleteEvent = async (id, token) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete event");
  }

  return response.json();
};

/**
 * GET /api/events/:id/secret
 */
export const getEventSecret = async (id, token) => {
  const response = await fetch(`${BASE_URL}/${id}/secret`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch event secret");
  }

  return response.json();
};
