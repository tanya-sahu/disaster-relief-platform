# ⚡ Tailwind CSS Quick Cheat Sheet

---

## 📱 Responsive Breakpoints

- `sm:` → small screen (mobile+)
- `md:` → medium screen (tablet)
- `lg:` → large screen (laptop)
- `xl:` → extra large screen

---

## 📦 Spacing

- `p-4` → padding all sides
- `px-4` → left + right padding
- `py-4` → top + bottom padding
- `m-4` → margin all sides
- `gap-4` → space between flex/grid items

---

## 📐 Flexbox (Layout)

- `flex` → enable flexbox
- `flex-row` → items side-by-side
- `flex-col` → items top-to-bottom
- `justify-center` → center horizontally
- `items-center` → center vertically
- `justify-between` → space between items

---

## 📏 Width & Height

- `w-full` → full width
- `h-full` → full height
- `min-h-screen` → full viewport height
- `min-h-[80vh]` → 80% viewport height

---

## 🎨 Colors & Styling

- `bg-blue-500` → background color
- `text-white` → text color
- `rounded` → border radius
- `rounded-lg` → medium rounded corners

---

## 🌫️ Shadow

- `shadow-sm` → light shadow
- `shadow` → normal shadow
- `shadow-md` → medium shadow
- `shadow-lg` → strong shadow
- `shadow-xl` → extra strong shadow

---

## 📱 Example (Responsive Layout)

```html
<div class="flex flex-col md:flex-row gap-4 lg:px-16 min-h-[80vh]">
  <div>Left Section</div>
  <div class="shadow-lg p-4">Right Section</div>
</div>