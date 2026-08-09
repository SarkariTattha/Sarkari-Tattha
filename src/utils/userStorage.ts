import { User } from '../types';

export const DEFAULT_STATIC_USERS: Record<string, { pass: string; user: User }> = {
  'admin@csc.com': {
    pass: 'admin123',
    user: {
      id: 1,
      name: 'Center Administrator',
      email: 'admin@csc.com',
      mobile: '9876543210',
      role: 'admin',
      address: 'Digital Seva Kendra HQ',
      created_at: '2026-01-01T00:00:00.000Z',
      is_active: 1
    }
  },
  'staff@csc.com': {
    pass: 'staff123',
    user: {
      id: 2,
      name: 'Operator Staff',
      email: 'staff@csc.com',
      mobile: '9876543211',
      role: 'staff',
      address: 'Counter 1',
      created_at: '2026-01-01T00:00:00.000Z',
      is_active: 1
    }
  },
  'customer@csc.com': {
    pass: 'customer123',
    user: {
      id: 3,
      name: 'Rahul Sharma',
      email: 'customer@csc.com',
      mobile: '9876543212',
      role: 'customer',
      address: 'Kolkata, WB',
      created_at: '2026-01-01T00:00:00.000Z',
      is_active: 1
    }
  }
};

// Helper: Get list of deleted user IDs and emails
export function getDeletedUserKeys(): { ids: Set<number>; emails: Set<string> } {
  const ids = new Set<number>();
  const emails = new Set<string>();
  try {
    const raw = localStorage.getItem('csc_deleted_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'number') ids.add(item);
          else if (typeof item === 'string') emails.add(item.toLowerCase());
          else if (item && typeof item === 'object') {
            if (item.id) ids.add(Number(item.id));
            if (item.email) emails.add(String(item.email).toLowerCase());
          }
        }
      }
    }
  } catch (e) {
    console.warn('Error parsing deleted users:', e);
  }
  return { ids, emails };
}

// Helper: Get user overrides (e.g., changes to status, name, role, password)
export function getUserOverrides(): Record<string, { user: User; pass?: string }> {
  try {
    const raw = localStorage.getItem('csc_user_overrides');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper: Get dynamically registered users
export function getRegisteredUsers(): Array<{ email: string; pass: string; user: User }> {
  try {
    const raw = localStorage.getItem('csc_registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Return all combined stored users (filtering deleted ones, applying overrides)
export function getStoredUsers(): User[] {
  const { ids: deletedIds, emails: deletedEmails } = getDeletedUserKeys();
  const overrides = getUserOverrides();
  const registered = getRegisteredUsers();

  const userMap = new Map<string, User>();

  // 1. Add Default Static Users
  for (const key of Object.keys(DEFAULT_STATIC_USERS)) {
    const staticObj = DEFAULT_STATIC_USERS[key];
    const emailKey = key.toLowerCase();
    if (!deletedIds.has(staticObj.user.id) && !deletedEmails.has(emailKey)) {
      userMap.set(emailKey, { ...staticObj.user });
    }
  }

  // 2. Add Dynamically Registered Users
  for (const reg of registered) {
    if (!reg.user) continue;
    const emailKey = (reg.user.email || reg.email).toLowerCase();
    if (!deletedIds.has(reg.user.id) && !deletedEmails.has(emailKey)) {
      userMap.set(emailKey, { ...reg.user });
    }
  }

  // 3. Apply Overrides
  for (const key of Object.keys(overrides)) {
    const ov = overrides[key];
    if (ov && ov.user) {
      const emailKey = (ov.user.email || key).toLowerCase();
      if (!deletedIds.has(ov.user.id) && !deletedEmails.has(emailKey)) {
        userMap.set(emailKey, { ...ov.user });
      }
    }
  }

  return Array.from(userMap.values()).sort((a, b) => b.id - a.id);
}

// Save or Update a User
export function saveStoredUser(user: User, password?: string): void {
  const cleanEmail = user.email.toLowerCase().trim();

  // Save override
  const overrides = getUserOverrides();
  overrides[cleanEmail] = {
    user,
    ...(password ? { pass: password } : overrides[cleanEmail]?.pass ? { pass: overrides[cleanEmail].pass } : {})
  };
  localStorage.setItem('csc_user_overrides', JSON.stringify(overrides));

  // Update in registered users list
  const registered = getRegisteredUsers();
  const idx = registered.findIndex((r) => r.email.toLowerCase() === cleanEmail || r.user.id === user.id);
  if (idx >= 0) {
    registered[idx] = {
      email: cleanEmail,
      pass: password || registered[idx].pass,
      user
    };
  } else {
    registered.push({
      email: cleanEmail,
      pass: password || '123456',
      user
    });
  }
  localStorage.setItem('csc_registered_users', JSON.stringify(registered));

  // If was previously deleted, remove from deleted list
  const { ids: deletedIds, emails: deletedEmails } = getDeletedUserKeys();
  if (deletedIds.has(user.id) || deletedEmails.has(cleanEmail)) {
    deletedIds.delete(user.id);
    deletedEmails.delete(cleanEmail);
    const updatedDeleted = [
      ...Array.from(deletedIds),
      ...Array.from(deletedEmails)
    ];
    localStorage.setItem('csc_deleted_users', JSON.stringify(updatedDeleted));
  }
}

// Set Active Status (1 = active, 0 = deactivated)
export function setUserActiveStatus(targetUser: User, isActive: boolean): User {
  const updatedUser: User = {
    ...targetUser,
    is_active: isActive ? 1 : 0
  };
  saveStoredUser(updatedUser);
  return updatedUser;
}

// Process and filter fetched API users with local deleted keys and overrides
export function processFetchedUsers(apiUsers: User[]): User[] {
  const { ids: deletedIds, emails: deletedEmails } = getDeletedUserKeys();
  const overrides = getUserOverrides();

  // Filter out deleted
  const activeList = apiUsers.filter((u) => {
    const cleanEmail = u.email.toLowerCase().trim();
    return !deletedIds.has(u.id) && !deletedEmails.has(cleanEmail);
  });

  // Apply overrides
  const result = activeList.map((u) => {
    const cleanEmail = u.email.toLowerCase().trim();
    if (overrides[cleanEmail]?.user) {
      return { ...u, ...overrides[cleanEmail].user };
    }
    return u;
  });

  // Include any custom registered users created locally that aren't in API users
  const apiEmails = new Set(result.map((u) => u.email.toLowerCase().trim()));
  const registered = getRegisteredUsers();
  for (const reg of registered) {
    if (!reg.user) continue;
    const cleanEmail = (reg.user.email || reg.email).toLowerCase().trim();
    if (!deletedIds.has(reg.user.id) && !deletedEmails.has(cleanEmail) && !apiEmails.has(cleanEmail)) {
      result.push(overrides[cleanEmail]?.user || reg.user);
      apiEmails.add(cleanEmail);
    }
  }

  return result.sort((a, b) => b.id - a.id);
}

// Permanently Delete User
export function deleteStoredUser(targetUser: User): void {
  const cleanEmail = targetUser.email.toLowerCase().trim();

  // 1. Add to deleted users
  const { ids: deletedIds, emails: deletedEmails } = getDeletedUserKeys();
  deletedIds.add(targetUser.id);
  deletedEmails.add(cleanEmail);
  const updatedDeletedList = [
    ...Array.from(deletedIds),
    ...Array.from(deletedEmails)
  ];
  localStorage.setItem('csc_deleted_users', JSON.stringify(updatedDeletedList));

  // 2. Remove from registered users
  const registered = getRegisteredUsers().filter(
    (r) => r.user.id !== targetUser.id && r.email.toLowerCase() !== cleanEmail
  );
  localStorage.setItem('csc_registered_users', JSON.stringify(registered));

  // 3. Remove from overrides
  const overrides = getUserOverrides();
  delete overrides[cleanEmail];
  delete overrides[String(targetUser.id)];
  localStorage.setItem('csc_user_overrides', JSON.stringify(overrides));
}

// Authenticate user in local storage (supports Mobile Number or Email or User ID)
export function authenticateStoredUser(
  identifier: string,
  pass: string
): { success: boolean; user?: User; error?: string } {
  const cleanInput = identifier.toLowerCase().trim();
  const cleanDigits = identifier.replace(/\D/g, '');
  const { ids: deletedIds, emails: deletedEmails } = getDeletedUserKeys();

  // Check if deleted
  if (deletedEmails.has(cleanInput)) {
    return { success: false, error: 'User account has been deleted.' };
  }

  const overrides = getUserOverrides();
  const registered = getRegisteredUsers();

  let foundUser: User | null = null;
  let storedPass: string | null = null;

  // Search by email, mobile, or ID in overrides
  for (const key of Object.keys(overrides)) {
    const ov = overrides[key];
    if (ov && ov.user) {
      const u = ov.user;
      if (
        u.email.toLowerCase() === cleanInput ||
        (u.mobile && u.mobile.replace(/\D/g, '') === cleanDigits && cleanDigits.length >= 6) ||
        String(u.id) === cleanInput
      ) {
        foundUser = u;
        storedPass = ov.pass || null;
        break;
      }
    }
  }

  // Search in registered users
  if (!foundUser) {
    const reg = registered.find(
      (r) =>
        r.email.toLowerCase() === cleanInput ||
        (r.user && r.user.mobile && r.user.mobile.replace(/\D/g, '') === cleanDigits && cleanDigits.length >= 6) ||
        (r.user && String(r.user.id) === cleanInput)
    );
    if (reg) {
      foundUser = reg.user;
      storedPass = reg.pass;
    }
  }

  // Search in default static users
  if (!foundUser) {
    for (const key of Object.keys(DEFAULT_STATIC_USERS)) {
      const staticObj = DEFAULT_STATIC_USERS[key];
      const u = staticObj.user;
      if (
        u.email.toLowerCase() === cleanInput ||
        (u.mobile && u.mobile.replace(/\D/g, '') === cleanDigits && cleanDigits.length >= 6) ||
        String(u.id) === cleanInput
      ) {
        foundUser = u;
        storedPass = staticObj.pass;
        break;
      }
    }
  }

  if (!foundUser || !storedPass) {
    return { success: false, error: 'Invalid Mobile Number / Log In ID or password.' };
  }

  if (deletedIds.has(foundUser.id)) {
    return { success: false, error: 'User account has been deleted.' };
  }

  // Check password
  if (storedPass !== pass) {
    return { success: false, error: 'Invalid Mobile Number / Log In ID or password.' };
  }

  // Check if deactivated
  if (foundUser.is_active === 0) {
    return {
      success: false,
      error: 'This account has been deactivated. Please contact the administrator.'
    };
  }

  return { success: true, user: foundUser };
}
