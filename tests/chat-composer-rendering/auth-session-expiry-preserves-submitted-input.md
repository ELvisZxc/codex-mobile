### Authentication session expiry preserves submitted input

#### Prerequisites

- 5910 test container is running and reachable.
- A logged-in 5910 browser session is available.

#### Steps

1. Open an existing thread in 5910.
2. Type a unique marker into the composer, for example `auth-expiry-preserve-20260914`.
3. Invalidate the browser session by clearing the `portal_session` cookie or waiting for an expired session.
4. Click Send.
5. Confirm the request reports an authentication/session-expired state and the page returns to the login screen.
6. Sign in again.

#### Expected results

- The request does not remain silently stuck behind a login-page HTML response.
- The exact marker remains in the composer after authentication is restored.
- The marker is submitted only after the user explicitly clicks Send again.
- A successfully accepted turn clears the composer as before.

#### Cleanup

- Remove the temporary browser cookie override if one was used.
