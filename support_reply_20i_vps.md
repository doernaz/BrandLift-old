### 20i Support Reply - Shifting to VPS Strategy

**Subject:** RE: What’s causing the immediate “530 Login failed” after provisioning

**Message:**

Hi 20i Support,

Understood. The shared hosting limitations (unavoidable FTP/SSH locking) are a blocker for our "zero-touch" requirement.

> *"Do you want to keep using 20i shared hosting packages specifically, or are you open to deploying to a server/VPS-style service in your 20i account where you can fully automate SSH from the moment the service exists?"*

**We are ready to switch to the VPS / Server strategy.**

We need a solution where we can:
1.  **Provision** a container/VPS via API.
2.  **Immediately authenticate** via SSH (using an SSH key we provide during provisioning or add immediately after).
3.  **Deploy** our static HTML site (e.g., via `scp` or `rsync`).
4.  **Map** a customer domain to it later.

Please provide the **recommended execution path** for this VPS-based approach, including:
-   The correct API endpoint to provision a lightweight VPS/Container.
-   How to inject our SSH key during or immediately after provisioning.
-   The endpoint to retrieve the assigned IP address.

We are looking for the most cost-effective tier for simple static sites (high volume), so a "container" or "managed cloud" style product is preferred if available.

Best,
BrandLift Dev Team
