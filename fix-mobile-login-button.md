# Fix for Mobile Login Button Layering Issue

## Problem Identified

The login button in the mobile sidebar is getting layered incorrectly or cut off at the bottom when the mobile menu is open. This happens because:

1. The mobile sidebar has a fixed height calculation:
   - For small mobile: `h-[calc(100vh-64px)]`
   - For regular mobile: `h-[calc(100vh-80px)]`

2. The bottom navigation bar is fixed at the bottom of the screen with a z-index of 50.

3. The login button is positioned at the bottom of the mobile sidebar in the user section.

The current height calculation doesn't leave enough space for the login button to be fully visible above the bottom navigation bar.

## Proposed Solution

Add more bottom padding to the user section in the mobile sidebar to push the login button up, ensuring it's fully visible within the sidebar's height and not overlapping with the bottom navigation bar.

## Implementation Details

In `frontend/src/components/AppSidebar.tsx`, we need to modify the CSS for the mobile user section (around line 523):

```tsx
{/* Mobile User Section */}
<div className={cn(
  "border-t border-[#1E2735]/50 bg-gradient-to-r from-[#0A0E16] to-[#10141E] flex-shrink-0",
  isSmallMobile ? "p-3" : "p-4"
)}>
```

Change to:

```tsx
{/* Mobile User Section */}
<div className={cn(
  "border-t border-[#1E2735]/50 bg-gradient-to-r from-[#0A0E16] to-[#10141E] flex-shrink-0",
  isSmallMobile ? "p-3 pb-6" : "p-4 pb-8"
)}>
```

This increases the bottom padding (`pb-6` for small mobile and `pb-8` for regular mobile) to ensure the login button is positioned higher in the sidebar and fully visible above the bottom navigation bar.

## Alternative Solutions (if needed)

If the above solution doesn't fully resolve the issue, we could consider:

1. **Adjust the height calculation for the mobile sidebar**:
   - Increase the amount subtracted from 100vh to ensure there's enough space for the login button.
   - For example, change `h-[calc(100vh-64px)]` to `h-[calc(100vh-80px)]` for small mobile.

2. **Add bottom margin to the login button**:
   - Add margin to the bottom of the login button to ensure it's not too close to the bottom of the sidebar.

3. **Make the user section scrollable**:
   - Add overflow-y-auto to the user section to make it scrollable if it doesn't fit within the available height.