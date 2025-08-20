import { apiRequest } from "@/lib/queryClient";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Token management
export function getAuthToken() {
  return localStorage.getItem("skillgap_token");
}

export function setAuthToken(token) {
  localStorage.setItem("skillgap_token", token);
}

export function removeAuthToken() {
  localStorage.removeItem("skillgap_token");
}

// Enhanced API request with auth
export async function authenticatedRequest(method, url, data) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response;
}

// File upload with auth
export async function uploadFile(file, endpoint) {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response.json();
}

// Auth API functions
export async function login(email, password) {
  const response = await authenticatedRequest("POST", "/api/auth/login", {
    email,
    password,
  });
  return response.json();
}

export async function register(name, email, password) {
  const response = await authenticatedRequest("POST", "/api/auth/register", {
    name,
    email,
    password,
  });
  return response.json();
}

// Resume API functions
export async function uploadResume(file) {
  return uploadFile(file, "/api/resume/upload");
}

export async function getResume() {
  const response = await authenticatedRequest("GET", "/api/resume");
  return response.json();
}

export async function deleteResume() {
  const response = await authenticatedRequest("DELETE", "/api/resume");
  return response.json();
}

export async function analyzeResume() {
  const response = await authenticatedRequest("POST", "/api/resume/analyze");
  return response.json();
}

// Analysis API functions
export async function analyzeJob(jobData) {
  const response = await authenticatedRequest("POST", "/api/analysis/job", jobData);
  return response.json();
}

export async function getLatestAnalysis() {
  const response = await authenticatedRequest("GET", "/api/analysis/latest");
  return response.json();
}

// API Key management
export async function updateGeminiApiKey(apiKey) {
  const response = await authenticatedRequest("POST", "/api/api-key/gemini", {
    apiKey,
  });
  return response.json();
}
