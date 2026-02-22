### 20i Support Reply - Discovery FAILED (404) on Split Endpoints

**Subject:** RE: What’s causing the immediate “530 Login failed” after provisioning

**Message:**

Hi 20i Support,

We are still blocked. The **split endpoints you provided also return 404**.

**Endpoints Tested:**
1.  `GET /reseller/33267/cloudServerSpecs` (with and without `?provider=20i`)
2.  `GET /reseller/33267/cloudServerZones` (with and without `?provider=20i`)
3.  We also tried using the wildcard ID `*` instead of `33267`.

**Result:**
All calls return:
```json
{
  "error": {
    "code": null,
    "message": "No route handler for /cloudServerSpecs on Reseller"
  }
}
```

It appears our API user/reseller tier does not have access to these discovery endpoints.

**To unblock us immediately:**
Please just provide the **exact string values** for:
1.  `spec`: For the smallest possible Unmanaged Cloud Server (1 core/1GB).
2.  `zone`: For London or Dallas.
3.  `configuration` payload structure for `addCloudServer`.

We will hardcode these values to verify the `addCloudServer` call works, bypassing the broken discovery step.

Best,
BrandLift Dev Team
