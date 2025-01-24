// auth.ts
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    document.cookie = `token=${token}; path=/; max-age=86400; samesite=strict`;
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('cart');
    
    // Remove from cookies - set expired date and empty value
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict';
  }
};

// Function to add auth header to fetch requests
export const addAuthHeader = (headers: HeadersInit = {}): HeadersInit => {
  const token = getAuthToken();
  if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  return headers;
};
