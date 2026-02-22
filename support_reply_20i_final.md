### 20i Support Reply - Discovery Output & Missing Endpoint

**Subject:** RE: What’s causing the immediate “530 Login failed” after provisioning

**Message:**

Hi 20i Support,

We ran the discovery steps as requested.

**Provider Discovery Result:**
`GET /reseller/33267/cloudProviders` returned:
```json
[
  "20i",
  "aws",
  "gcp"
]
```

**Spec Discovery Issue:**
However, the spec discovery call failed with a 404:
`GET /reseller/33267/cloudServerSpecsAndZones?provider=20i`
returned:
```json
{
  "error": {
    "code": null,
    "message": "No route handler for /cloudServerSpecsAndZones on Reseller"
  }
}
```

It seems `cloudServerSpecsAndZones` is not the correct endpoint name for our reseller tier or API version.

**Request:**
1.  Could you please provide the **correct endpoint** to list specs/zones for the `20i` provider?
2.  Alternatively, if you can just confirm the `spec` and `zone` strings for the **smallest 20i Cloud Server (London or Dallas)**, we can proceed with the `addCloudServer` call immediately.

Best,
BrandLift Dev Team
