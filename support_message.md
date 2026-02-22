### 20i Support Request - FTP & Provisioning Issues

**Subject:** 530 Login Failed Loop & API Questions for Reseller Provisioning

**Message:**

Hi 20i Support Team,

We are developing an automated provisioning system using your Reseller API and are encountering persistent FTP connectivity issues ("530 Login failed") immediately after creating packages, as well as some confusion regarding the correct API endpoints for our tier.

**Our Workflow:**
1. We provision a new package using `POST /reseller/*/addWeb` (Type: `284869`). This succeeds and returns a Package ID (e.g., `3582651`).
2. We wait 5-10 seconds for propagation.
3. We retrieve the package details via `GET /package/{id}/web` to confirm the username (e.g., `parker---sons.brandlift.ai`).
4. We attempt to connect via FTP (port 21, explicit TLS) using the password we provided during provisioning (or the one retrieved, if available).

**The Issue:**
We consistently receive a **530 Login failed** error:
`530 Login failed: please verify the username and password supplied, and that FTP locking is either disabled or permitted for your current IP address`

**Troubleshooting Steps Taken:**
- We are using `basic-ftp` with `secure: true` and `rejectUnauthorized: false`.
- We have verified the username matches the API response.
- We have attempted to explicitly "unlock" FTP via `POST /package/{id}/web/ftp/unlock` (sending `{ip: "..."}`), but this often returns 404/405 depending on the endpoint variant we guess.
- We have tried forcing a password reset via `POST /package/{id}/web/ftp/password`, but this also returns 404 "No route handler".

**Questions:**
1. **FTP Locking:** Is FTP locked by default for API-provisioned packages? If so, what is the *authoritative* endpoint to unlock it for a specific IP or globally for the package?
2. **Password Propagation:** Is there a known delay for the FTP password to become active after `addWeb`?
3. **Correct Endpoints:** We see 404s for `/package/{id}/web/1clk/WordPress` and `/package/{id}/web/ftp/password`. Are these endpoints restricted for our reseller tier or package type (`284869`)?
4. **Static Sites:** We are looking to host simple static HTML/PHP (no WordPress). Is there a lighter provisioning type we should use instead of the standard hosting package to ensure instant FTP access?

**Context:**
- **Reseller ID:** (Please insert if known, otherwise omitted)
- **Example Package ID:** 3582651
- **Target Environment:** StackStaging (e.g., `http://parker---sons-brandlift.ai.stackstaging.com`)

Any guidance on the correct "Provision -> Unlock -> Upload" sequence for your API would be greatly appreciated.

Thank you,
BrandLift Dev Team
