### 20i Support Reply - Provisioning Failed (Internal Error) & Missing Discovery

**Subject:** RE: What’s causing the immediate “530 Login failed” after provisioning

**Message:**

Hi 20i Support,
We attempted to provision the Cloud Server using the **exact structure you provided**, but both provider strings (`20i` and `20icloud`) returned a generic `Internal error`.

**Attempt 1:**
Payload:
```json
{
  "name": "brandlift-poc-001",
  "configuration": { "provider": "20i", "spec": "micro", "zone": "lhr", "optimisation": "default" },
  "periodMonths": 1,
  "type": "cloud-20i"
}
```
Result: `400 Bad Request`
```json
{ "error": { "code": -32000, "message": "Internal error" } }
```

**Attempt 2:**
Payload:
```json
{
  "name": "brandlift-poc-001",
  "configuration": { "provider": "20icloud", "spec": "micro", "zone": "dfw", "optimisation": "default" },
  "periodMonths": 1,
  "type": "cloud-20i"
}
```
Result: `400 Bad Request`
```json
{ "error": { "code": -32000, "message": "Internal error" } }
```

**Discovery Limitations:**
We also tried to discover valid specs/types to debug this ourselves, but ALL of the following return `No route handler` for our account:
- `GET /reseller/33267/cloudServerSpecs`
- `GET /reseller/33267/cloudServerZones`
- `GET /reseller/33267/vpsTypes`

**Critical Request:**
It seems our reseller tier lacks standard discovery endpoints or has a different schema.
Please provide the **exact, validated JSON payload** that works for Reseller ID `33267` to create a `micro` instance.
If we need to include an `image` or `os` field (e.g. `ubuntu-22-04`), please specify the field name and value, as the error message gives no validation hints.

Best,
BrandLift Dev Team
