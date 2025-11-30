# Data Model: User Management

## Schema Changes

### `users` Table

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `isAdmin` | `boolean` | No | `false` | Indicates if the user has administrative privileges. |

### Updated Schema Definition (Drizzle)

```typescript
export const users = pgTable("user", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    password: text("password"),
    isAdmin: boolean("isAdmin").default(false).notNull(), // New column
});
```

## Validation Rules (Zod)

### User Creation/Update Schema

```typescript
const UserSchema = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6).optional(), // Optional on update if not changing
    isAdmin: z.boolean().default(false),
});
```

### Password Update Schema

```typescript
const PasswordUpdateSchema = z.object({
    currentPassword: z.string().min(6), // Required for self-update
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
```
