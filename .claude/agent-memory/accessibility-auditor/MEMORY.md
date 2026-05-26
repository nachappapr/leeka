# Accessibility Auditor Memory

- [Coral gradient contrast ratios](project_coral_contrast.md) — verified WCAG ratios for white / opacity-white text on #F46A39 and #E94A1F; full-opacity white fails large-text 3:1 at the lighter stop
- [Opacity-reduced white on coloured backgrounds](feedback_opacity_on_colour.md) — text-white/90 /85 etc. always degrades contrast; flag immediately; use typographic hierarchy instead
- [Icon bubble contrast ratios](project_icon_bubble_contrast.md) — text-whatsapp-icon/bg-whatsapp-soft PASSES at 4.51:1 (fix confirmed); text-coral-press/bg-coral-soft 3.40:1; text-paid/bg-paid-soft borderline 3.05:1
- [Aging bar fill contrast ratios](project_aging_bar_contrast.md) — bg-pending-bar/bg-surface-2 passes at 5.33:1 (fix confirmed); bg-paid borderline 3.06:1; bg-overdue passes 4.60:1
- [role=img vs role=meter for data bars](project_role_img_vs_meter.md) — "share of total" bars use role=img+aria-label; role=meter/progressbar is wrong for this use case
- [text-coral on bg-card contrast fail](project_coral_on_white_contrast.md) — #f46a39 on #ffffff = 3.01:1; fails SC 1.4.3 for normal text; coral-press is darker candidate for fix
- [DataHead missing scope=col](project_table_scope_pattern.md) — TableHead/<th> in all DataTable usage ships without scope="col"; recurring SC 1.3.1 gap; fix is static HTML
- [cursor-pointer inert rows pattern](project_cursor_pointer_inert_rows.md) — DataRow + DataListRow have hover/cursor affordance but no keyboard contract; interactivity deferred; escalates to Critical when onClick lands
- [PillButton focus ring contrast fail](project_pillbutton_focus_ring.md) — ring-accent (#ffe7da) on bg-background (#fbf6ef) = 1.09:1; fails WCAG 2.4.11; fix: swap to ring-coral-press or ring-ring; static CSS, no client boundary
- [Active nav icon coral-on-coral-soft contrast fail](project_coral_on_coral_soft_contrast.md) — [&[data-active]_svg]:text-coral (#f46a39) on sidebar-accent (#ffe7da) = ~2.54:1; fails SC 1.4.11; fix: text-coral-press
- [Bare button focus ring — global outline-ring/50 fails 2.4.11](project_bare_button_focus_ring.md) — native <button> without explicit focus-visible:ring-* gets outline-ring/50 ≈ 1.67:1 on bg-background; recurring in Bell, MobileMenuButton
