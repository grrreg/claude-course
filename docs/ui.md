# UI Coding Standards

## Component Library

**ONLY use shadcn/ui components for all UI elements in this project.**

- **ABSOLUTELY NO custom components should be created**
- Do NOT use other component libraries
- All UI must be built exclusively using shadcn/ui primitives
- No exceptions to this rule

If a component is not available in shadcn/ui, consult with the team before proceeding.

## Date Formatting

Use `date-fns` for all date formatting operations.

### Standard Date Format

Dates must be formatted as: `do MMM yyyy`

Examples:
- 1st Sep 2025
- 2nd Aug 2025
- 3rd Jan 2026
- 4th Jun 2024

### Usage

```typescript
import { format } from "date-fns";

const formattedDate = format(new Date(), "do MMM yyyy");
// Output: "23rd Feb 2026"
```
