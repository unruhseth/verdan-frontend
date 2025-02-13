# Frontend Integration Guide

## Authentication Flow

### Overview
- The backend uses JWT (JSON Web Token) for authentication
- Tokens contain `account_id` and `role` in claims
- Tokens must be included in all authenticated requests

### Endpoints
- Login: `POST /auth/login`
  - Request body: `{ "email": string, "password": string }`
  - Response: `{ "token": string, "user": UserObject }`

### Token Usage
- Include token in Authorization header: `Authorization: Bearer <token>`
- Token is automatically managed by the API utility (`src/utils/api.js`)
- Token is stored in localStorage under 'token' key

## CORS Configuration

The backend is configured with the following CORS settings:
- Allowed Origin: `http://localhost:3000`
- Allowed Methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Allowed Headers: `Content-Type, Authorization`
- Credentials: Supported

## API Configuration

### Base URL
- Default: `http://localhost:5000`
- Configurable via environment variable: `REACT_APP_API_URL`

### App Endpoints
- Each app has its own prefixed endpoint:
  - Inventory: `/inventory/*`
  - Multi Control: `/multi_control/*`
  - Task Manager: `/task_manager/*`

## Response Format

### Success Responses
- HTTP Status: 200/201
- Format: `{ "data": <response_data> }` or `{ "message": "success_message" }`

### Error Responses
- HTTP Status: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden)
- Format: `{ "error": "error_message" }`

## Data Models

### Common Fields
All models include:
- `id`: UUID primary key
- `account_id`: For multi-tenancy
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Nested Objects
- Response data includes related objects where relevant
- Example: User object includes role and account information

## Environment Setup

Required environment variables:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=<key from .env>
```

## App Management

### Installation
- Apps can be installed/uninstalled per account
- Frontend must check `is_installed` status before showing app features
- Installation status available through account settings API

## Role-Based Access Control

### Available Roles
- user: Basic access
- admin: Enhanced access within account
- account_admin: Full account management
- master_admin: System-wide access

### Implementation
- Frontend should check user role before rendering protected features
- Some API endpoints require specific admin roles
- Role information is included in the JWT token

## Best Practices

1. **Error Handling**
   - Implement global error handling for API requests
   - Show appropriate user feedback for different error types

2. **State Management**
   - Cache frequently accessed data
   - Implement proper loading states
   - Handle token expiration gracefully

3. **Security**
   - Never store sensitive data in localStorage except JWT token
   - Validate user permissions client-side for UI purposes
   - Always verify permissions server-side

4. **Performance**
   - Implement request caching where appropriate
   - Use pagination for large data sets
   - Optimize API calls to minimize requests

## Testing

- Test authentication flows thoroughly
- Verify CORS settings in development and production
- Test role-based access control scenarios
- Validate error handling for all API interactions 