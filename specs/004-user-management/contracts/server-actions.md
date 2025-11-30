# Server Actions: User Management

These actions will be located in `src/app/actions/user.ts` (or similar).

## User Management (Admin Only)

### `getUsers`
- **Description**: Fetch paginated list of users.
- **Input**: `{ page: number, limit: number, search?: string }`
- **Output**: `{ users: User[], total: number }`
- **Auth**: Requires `isAdmin: true`.

### `createUser`
- **Description**: Create a new user.
- **Input**: `{ name?: string, email: string, password: string, isAdmin: boolean }`
- **Output**: `{ success: boolean, user?: User, error?: string }`
- **Auth**: Requires `isAdmin: true`.

### `updateUser`
- **Description**: Update an existing user.
- **Input**: `{ id: string, name?: string, email?: string, isAdmin?: boolean }`
- **Output**: `{ success: boolean, user?: User, error?: string }`
- **Auth**: Requires `isAdmin: true`.

### `deleteUser`
- **Description**: Delete a user.
- **Input**: `{ id: string }`
- **Output**: `{ success: boolean, error?: string }`
- **Auth**: Requires `isAdmin: true`.
- **Validation**: Cannot delete self.

### `adminResetPassword`
- **Description**: Admin resets another user's password.
- **Input**: `{ userId: string, newPassword: string }`
- **Output**: `{ success: boolean, error?: string }`
- **Auth**: Requires `isAdmin: true`.

## Self Management (Authenticated Users)

### `updateSelfPassword`
- **Description**: User updates their own password.
- **Input**: `{ currentPassword: string, newPassword: string }`
- **Output**: `{ success: boolean, error?: string }`
- **Auth**: Requires authentication.
