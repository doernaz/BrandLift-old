### 20i Support Reply - Choice: Unmanaged Cloud Server

**Subject:** RE: What’s causing the immediate “530 Login failed” after provisioning

**Message:**

Hi 20i Support,

Thanks for the detailed breakdown.

We will proceed with the **Unmanaged Cloud Server** option.
This aligns perfectly with our need for a cost-effective, high-volume static site multiplexer (Nginx + many vhosts) where we fully control the OS and security.

**Our Choice:**
Product: **Unmanaged Cloud Server**
Tier: Smallest available for Proof of Concept (e.g., 1 Core / 1GB RAM).
OS: **Ubuntu 22.04 LTS** (or 24.04 if available).

**Please provide the exact API integration details for this choice:**
1.  **Provisioning Endpoint & Payload:** The exact URL and JSON body fields for `POST /reseller/{resellerId}/addCloudServer` (including how to specify the OS and specs).
2.  **SSH Bootstrap:** Can we inject an SSH Public Key or `user_data` script in the provisioning payload?
    *   *If yes:* Please provide the field name.
    *   *If no:* Please provide the endpoint to retrieve the initial root password so we can bootstrap our keys.
3.  **IP Retrieval:** The exact `GET` endpoint and response field to find the assigned public IP address once the server is ready.

We are ready to implement this immediately upon receiving the payload documentation.

Best,
BrandLift Dev Team
