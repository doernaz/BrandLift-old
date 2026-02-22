---
description: Generates 3 distinct brand variants (Kinetic, Essentialist, Architect) based on search data inputs, strictly adhering to Minimalist Tech aesthetic.
---

# EXECUTE BRANDLIFT_VARIANT_ENGINE

## Protocol Scope
This workflow generates high-fidelity brand identity variants for a specific entity found during the search phase.

## Inputs (DATA_PACK)
- `industry_vector`: The primary category (e.g., "Family Law").
- `entity_name`: Official business name.
- `company_name`: (Same as entity_name).
- `user_input`: Original search context used to determine vibe.

## Procedure
1. **Initialize Context**: Flush previous search memory.
2. **Apply Aesthetic Guard [Minimalist Tech]**:
   - **BANNED**: Boardrooms, shaking hands, glass tiles, mahogany.
   - **REQUIRED**: Anodic aluminum, matte finishes, geometric abstraction.
3. **Generate Variants**:
   - **Theme 1: The Kinetic** (Dynamic, High Contrast, Diagonal).
   - **Theme 2: The Essentialist** (Zen, Serif, 0.5px Borders).
   - **Theme 3: The Architect** (Dark Mode, Grid, Mono-font).
4. **Output**: Rendered HTML/CSS (via React Components) for each variant.

## Execution
This workflow is triggered via the `processSingleCandidate` pipeline in `antigravity-core.ts`.
To manually trigger for a test case, use the `scripts/test-gemini.js` (modified) or the Scan UI.
