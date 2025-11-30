# Data Model: Add Auth & DB

**Feature**: Add Auth & DB (001-add-auth-db)

## Entity: User

Represents a registered user of the system.

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `id` | UUID | Yes | Yes | Primary Key. Default: `gen_random_uuid()` |
| `name` | Text | No | No | User's display name |
| `email` | Text | Yes | Yes | User's email address |
| `password` | Text | Yes | No | Hashed password |
| `image` | Text | No | No | URL to user's avatar |
| `emailVerified` | Timestamp | No | No | When the email was verified |

## Relationships

- None for this feature.

## Drizzle Schema (Preview)

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  image: text("image"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
});
```
