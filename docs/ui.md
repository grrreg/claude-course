# UI Coding Standards

## Component Library

This project uses **shadcn/ui** as the exclusive UI component library.

### Rules

1. **ONLY use shadcn/ui components** - All UI elements must be built using shadcn/ui components
2. **NO custom components** - Do not create custom UI components; use shadcn/ui primitives and compositions instead
3. **Install components as needed** - Use `npx shadcn@latest add <component>` to add new components

### Installing Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
# etc.
```

### Component Location

shadcn/ui components are installed to `src/components/ui/` by default.

### Styling

- Use the built-in shadcn/ui variants and sizes
- Customize appearance through Tailwind CSS utility classes
- Modify theme variables in `src/app/globals.css` for global theming

### Examples

**Correct:**
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function MyFeature() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  )
}
```

**Incorrect:**
```tsx
// DO NOT create custom button components
function CustomButton({ children }) {
  return <button className="...">{children}</button>
}
```

## Date Formatting

This project uses **date-fns** for all date formatting.

### Format

Dates should be formatted with ordinal day, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Usage

```tsx
import { format } from "date-fns"

// Format: "do MMM yyyy"
const formattedDate = format(new Date(), "do MMM yyyy")
// Output: "1st Sep 2025"
```

### Reference

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Available Components](https://ui.shadcn.com/docs/components)
- [date-fns Documentation](https://date-fns.org/)
