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

export const removeAuthToken = (type: 'user' | 'admin' | 'all' = 'all') => {
  if (typeof window !== 'undefined') {
    if (type === 'user' || type === 'all') {
      // Remove user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('cart');
      
      // Remove user token from cookies
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict';
    }

    if (type === 'admin' || type === 'all') {
      // Remove admin data from localStorage
      localStorage.removeItem('adminToken');
      
      // Remove admin token from cookies
      document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict';
    }
  }
};

// Function to get admin token
export const getAdminToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};

// Function to add auth header to fetch requests
export const addAuthHeader = (headers: HeadersInit = {}): HeadersInit => {
  const token = getAuthToken();
  const adminToken = getAdminToken();
  
  if (adminToken) {
    return {
      ...headers,
      'Authorization': `Bearer ${adminToken}`,
    };
  } else if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  return headers;
};
