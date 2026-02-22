### 20i Support Reply - Major Discovery: VPS Endpoint is ALSO Missing

**Subject:** RE: Internal error solved - found valid StackCP users

**Message:**

Hi 20i Support,

We tried the "Unmanaged VPS" path (`/addVps`) you suggested as the fastest unblock.

**Result:** `404 Not Found`
```json
{
  "error": {
    "code": null,
    "message": "No route handler for /addVps on Reseller"
  }
}
```

It appears our Reseller Account (`33267`) is on a version of the API that **does not have access** to:
1.  `addVps`
2.  `cloudServerSpecs` (Discovery)
3.  `cloudServerZones` (Discovery)

**WE ARE LOCKED OUT.**
We cannot provision *any* server infrastructure because the endpoints for our account tier seem to be missing or named differently.

**Request Tracing for the failed `addCloudServer` calls:**
You asked for correlation data. Here is the last failed Cloud Server attempt:
-   **URL:** `https://api.20i.com/reseller/33267/addCloudServer`
-   **Time:** `2026-02-15T05:16:41.356Z` (Approx)
-   **Payload:**
    ```json
    {
      "configuration": {
        "provider": "20icloud",
        "mvpsName": "brandlift-ops-core-v1",
        "optimisation": "default",
        "spec": "micro",
        "zone": "lhr"
      },
      "periodMonths": 1,
      "type": "cloud-20i",
      "forUser": "stack-user:5191983"
    }
    ```
-   **Result:** `400 Internal error` (-32000)

**Please escalate this.**
We need a path to provision a server. Either enable the standard endpoints for our account or tell us the *exact* legacy/alternative endpoints we must use for Reseller 33267.

Best,
BrandLift Dev Team
