### 20i Support Reply - Discovery Success & Request for Targeted Payload

**Subject:** RE: Internal error solved - found valid StackCP users

**Message:**

Hi 20i Support,

Great catch.
The `susers` endpoint **did work** and returned a list of users.

We have identified our core "BrandLift" user which seems to be the best candidate for the system-wide Cloud Server:
User: `brandlift.ai`
ID: `stack-user:5191983`

**Action:**
We will retry the `addCloudServer` call effectively immediately using the payload you suggested, with the `forUser` field mapped to this ID.

**Payload to be used:**
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

We will report back if this succeeds in generating a `cloudServerId`.

Best,
BrandLift Dev Team
