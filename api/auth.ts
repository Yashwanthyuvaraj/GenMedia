// MOCK API for demonstration purposes - now with localStorage persistence

interface User {
  email: string;
  password: string; // In a real app, this should be a hash
}

// Helper to get users from localStorage
const getUsers = (): User[] => {
  const usersJson = localStorage.getItem('genmedia_users');
  if (usersJson) {
    try {
      return JSON.parse(usersJson);
    } catch (e) {
      console.error("Failed to parse users from localStorage", e);
      return [];
    }
  }
  return [];
};

// Helper to save users to localStorage
const saveUsers = (users: User[]): void => {
  localStorage.setItem('genmedia_users', JSON.stringify(users));
};


// Simulates a login request
export const login = async (email: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> => {
    // Basic validation
    if (!email || !password) {
        return { success: false, message: 'Email and password are required.' };
    }
    console.log(`Attempting login for ${email}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        return { success: false, message: 'This email is not registered. Please sign up.' };
    }

    if (user.password !== password) {
        return { success: false, message: 'Incorrect password. Please try again.' };
    }
    
    // Credentials match, create a session
    const mockToken = `mock-token-${Date.now()}`;
    localStorage.setItem('authToken', mockToken);
    return { success: true, token: mockToken };
};

// Simulates a signup request
export const signup = async (email: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> => {
    // Basic validation
    if (!email || !password || password.length < 6) {
        return { success: false, message: 'Please provide a valid email and a password of at least 6 characters.' };
    }
    console.log(`Attempting signup for ${email}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getUsers();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        return { success: false, message: 'A user with this email already exists. Please log in.' };
    }

    // Add new user
    const newUser: User = { email, password };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    // Simulate a successful signup and automatic login
    const mockToken = `mock-token-${Date.now()}`;
    localStorage.setItem('authToken', mockToken);
    return { success: true, token: mockToken };
};

// Simulates a logout request
export const logout = (): void => {
    localStorage.removeItem('authToken');
    console.log('User logged out.');
};

// Checks if the user has a valid session
export const checkAuthStatus = (): { isLoggedIn: boolean } => {
    const token = localStorage.getItem('authToken');
    return { isLoggedIn: !!token };
};
