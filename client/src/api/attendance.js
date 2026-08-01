// src/api/attendance.js

const BASE_URL = "/api/attendance";

/**
 * Mark Attendance
 * POST /api/attendance
 */
export const markAttendance = async (attendanceData, token) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(attendanceData),
  });

  if (!response.ok) {
    throw new Error("Failed to mark attendance");
  }

  return response.json();
};

/**
 * Get Attendance of an Event
 * GET /api/attendance/:eventId
 */
export const getEventAttendance = async (eventId, token) => {
  const response = await fetch(`${BASE_URL}/${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch attendance");
  }

  return response.json();
};
