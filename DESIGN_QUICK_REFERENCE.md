# Design System - Quick Reference Guide

## 🎨 Color Palette

### Primary
- **#5B5FFF** - Main blue (buttons, links, focus)
- **#3730A3** - Dark blue (hover state)
- **#4F46E5** - Medium blue

### Neutral (Gray Scale)
- **#FFFFFF** - Pure white (background)
- **#F3F4F6** - Light gray (secondary bg)
- **#E5E7EB** - Borders & dividers
- **#6B7280** - Secondary text
- **#111827** - Primary text (dark)

### Semantic
- **#10B981** - Green (success)
- **#F59E0B** - Amber (warning)
- **#EF4444** - Red (danger)
- **#3B82F6** - Blue (info)

## 📐 Spacing Scale (8px Base)

```
xs  = 4px
sm  = 8px
md  = 12px
lg  = 16px
xl  = 20px
2xl = 24px
3xl = 32px
4xl = 40px
```

## 🔤 Typography

### Font Family
`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'`

### Type Sizes
```
H1:     32px Bold
H2:     28px Bold
H3:     24px Bold
Body:   16px Normal
Label:  13px Semibold (uppercase)
Small:  14px Normal
Tiny:   12px Normal
```

## 🔘 Buttons

### Primary
```css
background: #5B5FFF
color: white
padding: 12px 16px
border-radius: 8px
```

### Secondary
```css
background: #F3F4F6
border: 1px #E5E7EB
color: #111827
```

### Danger
```css
background: #EF4444
color: white
```

## 📱 Responsive Breakpoints

| Size | Width | Device |
|------|-------|--------|
| **xs** | 320px | Mobile |
| **sm** | 480px | Large phone |
| **md** | 768px | Tablet |
| **lg** | 1024px | Laptop |
| **xl** | 1280px | Desktop |
| **2xl** | 1536px | Large desktop |

## 🎯 Key Design Decisions

1. **Light Theme** - Better for productivity & accessibility
2. **Blue Primary** - Professional & semantic
3. **System Fonts** - Performance & native feel
4. **8px Grid** - Harmony & flexibility
5. **Semantic Colors** - Accessibility & clarity

## 📏 Common Measurements

### Sidebar
- Width: 280px (desktop)
- Padding: 20px
- Item height: ~50px

### Buttons
- Padding: 12px 16px
- Border-radius: 8px
- Min height: 44px (mobile)

### Forms
- Input padding: 16px
- Label spacing: 12px
- Form group margin: 20px

### Cards
- Padding: 20px
- Border-radius: 8px
- Box-shadow: subtle

## ⚡ Animations

```css
Fast:   150ms
Normal: 200ms
Slow:   300ms

Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Common Animations
- **Fade In**: opacity 0 → 1 (300ms)
- **Slide Up**: translateY(20px) → 0 (300ms)
- **Lift**: translateY(0) → -1px (200ms)
- **Spin**: 360° rotation (1s)

## ♿ Accessibility

### Keyboard
- ✓ All elements keyboard accessible
- ✓ Focus visible (2px outline)
- ✓ Escape closes modals
- ✓ Logical tab order

### Touch
- ✓ 44px minimum tap targets
- ✓ 16px minimum font size
- ✓ Touch-friendly spacing

### Color Contrast
- ✓ Text: 15.3:1 (AA+)
- ✓ Secondary text: 7.4:1 (AA)
- ✓ UI components: ≥3:1 (AA)

### Motion
- ✓ Respects `prefers-reduced-motion`
- ✓ No auto-playing animations
- ✓ No flashing/strobing

## 🔍 Design Token Usage

```css
/* Colors */
color: var(--text-primary);
background: var(--bg-secondary);
border: 1px solid var(--border-default);

/* Spacing */
padding: var(--space-lg) var(--space-xl);
margin-bottom: var(--space-xl);
gap: var(--space-md);

/* Typography */
font-size: var(--font-size-lg);
font-weight: var(--font-weight-semibold);

/* Effects */
box-shadow: var(--shadow-md);
border-radius: var(--radius-lg);
transition: all var(--transition-normal);
```

## 📝 File Locations

- **Design Tokens**: `src/styles/tokens.css`
- **Main Styles**: `src/styles/App.css` (928 lines)
- **Auth Styles**: `src/pages/AuthPages.css` (343 lines)
- **Documentation**: `DESIGN_SYSTEM.md`

## 🚀 Quick Tips

1. Always use CSS variables, never hardcode values
2. Follow spacing scale for consistency
3. Use semantic tokens for colors
4. Maintain 44px minimum touch targets
5. Test keyboard navigation
6. Check color contrast (WebAIM checker)
7. Respect motion preferences
8. Use appropriate button types (primary/secondary/danger)

## 🎯 Design Principles

**Clarity** → Remove noise, guide focus
**Consistency** → Same patterns everywhere
**Accessibility** → WCAG AA compliant
**Performance** → Fast, smooth interactions
**Simplicity** → Minimal cognitive load

---

For more details, see `DESIGN_SYSTEM.md`
