

# Make API Testing Page Public

## What Changes

Move the `/api-testing` route outside the `ProtectedRoute` + `AppLayout` wrapper so anyone with the URL can access it without logging in.

## Implementation

### 1. `src/App.tsx`
- Remove line 77 (`<Route path="/api-testing" element={<ApiTestingPage />} />`) from inside the protected `AppLayout` block
- Add a standalone public route before the catch-all: `<Route path="/api-testing" element={<ApiTestingPage />} />`
- The page already has its own API key input for authentication to the external API, so no auth is needed at the route level

### 2. `src/pages/ApiTestingPage.tsx`
- No changes needed — the page is self-contained with its own API key management and doesn't depend on user session for functionality

This is a one-line move in `App.tsx`. The API testing page authenticates via API keys (not user session), so removing the login gate is safe.

