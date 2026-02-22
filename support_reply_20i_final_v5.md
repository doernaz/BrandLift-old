### 20i Support Reply - Internal Error Persists Even With Valid User

**Subject:** RE: Internal error solved - found valid StackCP users

**Message:**

Hi 20i Support,

We updated the payload to include the valid `forUser: "stack-user:5191983"` (brandlift.ai) and the `mvpsName` field as requested.

However, the result is **still** a generic `Internal error`.

**Payload Used:**
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

**Result:** `400 Bad Request` -> `Internal error` (-32000).

Is it possible that `micro` / `lhr` combination is invalid for our account? Or is there another mandatory field (e.g. `image` or `os`) that is missing? Since we cannot run discovery to find valid values, we are stuck.

Please provide a payload that is *guaranteed* to work for our account `33267`.

Best,
BrandLift Dev Team
