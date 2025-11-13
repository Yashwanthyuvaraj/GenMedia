// MOCK API for demonstration purposes - now with localStorage persistence

interface User {
  name: string;
  email: string;
  password: string; // In a real app, this should be a hash
}

// Helper to get users from localStorage
const getUsers = (): User[] => {
  const usersJson = localStorage.getItem('genmedia_users');
  if (usersJson) {
    try {
      const parsedData = JSON.parse(usersJson);
      // Ensure we have an array before returning
      if (Array.isArray(parsedData)) {
        return parsedData;
      }
    } catch (e) {
      console.error("Failed to parse users from localStorage", e);
    }
  }
  return [];
};

// Helper to save users to localStorage
const saveUsers = (users: User[]): void => {
  localStorage.setItem('genmedia_users', JSON.stringify(users));
};


// Simulates a login request
export const login = async (email: string, password: string): Promise<{ success: boolean; token?: string; message?: string; userName?: string; }> => {
    // Basic validation
    if (!email || !password) {
        return { success: false, message: 'Email and password are required.' };
    }
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Attempting login for ${normalizedEmail}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getUsers();
    // Defensively normalize the stored email during comparison to prevent any data inconsistencies.
    const user = users.find(u => (u.email || '').toLowerCase().trim() === normalizedEmail);

    if (!user) {
        return { success: false, message: 'No account found with this email. Please double-check your spelling or sign up.' };
    }

    if (user.password !== password) {
        return { success: false, message: 'The password you entered is incorrect. Please try again.' };
    }
    
    // Credentials match, create a session
    const mockToken = `mock-token-${Date.now()}`;
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('userName', user.name); // Store user's name
    return { success: true, token: mockToken, userName: user.name };
};

// Simulates a signup request
export const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string; }> => {
    // Basic validation
    if (!name.trim() || !email) {
        return { success: false, message: 'Please provide a valid name and email.' };
    }

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return { success: false, message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Attempting signup for ${normalizedEmail}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getUsers();
    const existingUser = users.find(u => u.email === normalizedEmail);

    if (existingUser) {
        return { success: false, message: 'A user with this email already exists. Please log in.' };
    }

    // Add new user with normalized email
    const newUser: User = { name: name.trim(), email: normalizedEmail, password };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    
    // On success, just confirm creation. UI will handle redirecting to login.
    return { success: true, message: 'Account created successfully!' };
};

// Simulates a logout request
export const logout = (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    console.log('User logged out.');
};

// Checks if the user has a valid session
export const checkAuthStatus = (): { isLoggedIn: boolean; userName: string | null; } => {
    const token = localStorage.getItem('authToken');
    const userName = localStorage.getItem('userName');
    return { isLoggedIn: !!token, userName };
};