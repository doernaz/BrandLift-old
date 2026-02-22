### 20i Support Reply - Request for "Robust Provision -> Deploy" Pattern

**Subject:** RE: What’s causing the immediate “530 Login failed” after provisioning

**Message:**

Hi 20i Support,

Thank you for clarifying the "FTP Locked by Default" policy. That explains the 530 errors perfectly.

As you noted, we require **fully automated, zero-touch deployment**. We are building a system that provisions a package and immediately pushes a generated static site (HTML/CSS) to it. We cannot log into the control panel to manually unlock FTP for every new client site.

You mentioned:
> *"If you tell me which transfer method you’re aiming for (FTPS vs SFTP vs SSH-based deploy vs Git/CI pushing files), I can map the most robust “Provision -> Deploy” pattern on 20i hosting given the default FTP locking behavior."*

**We are open to ANY transfer method that supports immediate, headless automation.**

Could you please provide the technical details (API endpoints or connection patterns) for the recommended method?

Specifically:
1.  **SFTP / SSH:** Is SSH/SFTP also locked by default? If not, how do we retrieve the SSH keys or credentials via API immediately after `addWeb`?
2.  **Git / StackCP:** Does the API allow us to initialize a Git repo or retrieve a deployment URL for the new package?
3.  **File Manager API:** Is there a direct HTTP API for uploading files (bypassing FTP/SSH protocols entirely)?

**Our Goal:**
Step 1: Call `addWeb` to create the package.
Step 2: Immediately push `index.html` to `public_html` programmatically.

Please let us know the specific execution path to achieve Step 2 without manual intervention.

Best,
BrandLift Dev Team
