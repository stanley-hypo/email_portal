# Feature Specification: Unified Login with Portal Access

**Feature Branch**: `003-unified-login`  
**Created**: 2025-11-30  
**Status**: Draft  
**Input**: User description: "取代現有login，login 後可以使用 smtp or PDF 入邊portal 功能"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single Login Access to Portal (Priority: P1)

Users need a unified login experience that grants them access to both SMTP and PDF portal functionalities after successful authentication, replacing the current login system.

**Why this priority**: This is the core requirement that enables users to access the portal's main features. Without this, users cannot utilize any portal functionality.

**Independent Test**: Can be fully tested by logging in with valid credentials and verifying that the user is redirected to a portal dashboard or selection page where both SMTP and PDF features are accessible. Delivers immediate value by providing authenticated access to core portal features.

**Acceptance Scenarios**:

1. **Given** a user with valid credentials, **When** they enter their email and password on the login page and submit, **Then** they are successfully authenticated and redirected to the portal home/dashboard
2. **Given** an authenticated user on the portal home, **When** they view the available options, **Then** they can see and access both SMTP configuration and PDF configuration features
3. **Given** a user with invalid credentials, **When** they attempt to login, **Then** they see an appropriate error message and remain on the login page
4. **Given** an unauthenticated user, **When** they attempt to access SMTP or PDF portal pages directly, **Then** they are redirected to the login page

---

### User Story 2 - SMTP Portal Access (Priority: P2)

After successful login, users can access the SMTP configuration portal to manage SMTP settings, authentication tokens, and email configurations.

**Why this priority**: SMTP functionality is a primary portal feature that users need to manage email sending capabilities. This is essential for users who need to configure email services.

**Independent Test**: Can be tested by logging in and navigating to the SMTP portal section, then performing CRUD operations on SMTP configurations. Delivers value by enabling email service management.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they navigate to the SMTP portal section, **Then** they can view all existing SMTP configurations
2. **Given** an authenticated user in the SMTP portal, **When** they create a new SMTP configuration, **Then** the configuration is saved and appears in their configuration list
3. **Given** an authenticated user with existing SMTP configs, **When** they edit or delete a configuration, **Then** the changes are persisted and reflected immediately
4. **Given** an authenticated user, **When** they generate authentication tokens for SMTP, **Then** tokens are created and can be used for API access

---

### User Story 3 - PDF Portal Access (Priority: P2)

After successful login, users can access the PDF generation portal to manage PDF configurations, IP whitelists, and authentication tokens for HTML-to-PDF conversion.

**Why this priority**: PDF functionality is a primary portal feature that users need to manage document generation capabilities. This is equally important to SMTP for users requiring PDF services.

**Independent Test**: Can be tested by logging in and navigating to the PDF portal section, then performing CRUD operations on PDF configurations. Delivers value by enabling PDF generation service management.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they navigate to the PDF portal section, **Then** they can view all existing PDF configurations
2. **Given** an authenticated user in the PDF portal, **When** they create a new PDF configuration with IP whitelist settings, **Then** the configuration is saved with proper access controls
3. **Given** an authenticated user with existing PDF configs, **When** they test PDF generation, **Then** they can generate and download test PDFs
4. **Given** an authenticated user, **When** they manage authentication tokens for PDF API, **Then** tokens are created and can be used for API access

---

### User Story 4 - Session Management (Priority: P3)

Users have a persistent authenticated session that allows them to navigate between SMTP and PDF portals without re-authenticating, with proper session timeout and logout functionality.

**Why this priority**: This enhances user experience by maintaining authentication state across portal sections, but the core functionality can work without advanced session features initially.

**Independent Test**: Can be tested by logging in, navigating between SMTP and PDF sections, and verifying session persistence. Also test logout functionality and session timeout behavior.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they navigate between SMTP and PDF portal sections, **Then** they remain authenticated without needing to login again
2. **Given** an authenticated user, **When** they click logout, **Then** their session is terminated and they are redirected to the login page
3. **Given** an authenticated user with an idle session, **When** the session timeout period expires, **Then** they are automatically logged out and redirected to login
4. **Given** a logged-out user, **When** they attempt to access any portal feature, **Then** they are redirected to the login page

---

### Edge Cases

- What happens when a user's session expires while they are in the middle of creating/editing a configuration?
- How does the system handle concurrent login attempts from the same user account?
- What happens if a user tries to access a portal feature that their account doesn't have permissions for?
- How does the system handle network failures during authentication?
- What happens when a user navigates using browser back/forward buttons after logout?
- How does the system handle password reset or account recovery flows?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate users using email and password credentials
- **FR-002**: System MUST validate user credentials against a secure user database
- **FR-003**: System MUST create and maintain authenticated sessions for logged-in users
- **FR-004**: System MUST redirect authenticated users to a portal home/dashboard after successful login
- **FR-005**: System MUST provide access to both SMTP and PDF portal features from the portal home
- **FR-006**: System MUST protect SMTP and PDF portal routes, requiring authentication to access them
- **FR-007**: System MUST redirect unauthenticated users attempting to access protected routes to the login page
- **FR-008**: System MUST display appropriate error messages for failed login attempts
- **FR-009**: System MUST allow users to logout, terminating their authenticated session
- **FR-010**: System MUST maintain session state as users navigate between SMTP and PDF portal sections
- **FR-011**: System MUST preserve all existing SMTP configuration management functionality (create, read, update, delete configurations)
- **FR-012**: System MUST preserve all existing PDF configuration management functionality (create, read, update, delete configurations)
- **FR-013**: System MUST preserve authentication token management for both SMTP and PDF services
- **FR-014**: System MUST handle session timeout after a period of inactivity
- **FR-015**: System MUST prevent access to portal features without valid authentication

### Key Entities

- **User**: Represents an authenticated user with credentials (email, password) who can access portal features
- **Session**: Represents an authenticated user session with expiration time and authentication state
- **SMTP Configuration**: Existing entity for SMTP server settings, accessible only to authenticated users
- **PDF Configuration**: Existing entity for PDF generation settings, accessible only to authenticated users
- **Authentication Token**: Existing entity for API access tokens, managed by authenticated users

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully login and access the portal home within 5 seconds
- **SC-002**: Authenticated users can navigate between SMTP and PDF portal sections without re-authentication
- **SC-003**: 100% of unauthenticated access attempts to protected routes are redirected to login
- **SC-004**: Users can complete the login process in under 30 seconds
- **SC-005**: All existing SMTP and PDF configuration management features remain fully functional after login integration
- **SC-006**: Session logout completes within 2 seconds and properly clears authentication state
- **SC-007**: Failed login attempts display clear, user-friendly error messages within 2 seconds
- **SC-008**: The system maintains 99.9% uptime for authentication services
