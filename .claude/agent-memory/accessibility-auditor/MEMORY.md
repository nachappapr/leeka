# Accessibility Auditor Memory

- [Coral gradient contrast ratios](project_coral_contrast.md) — verified WCAG ratios for white / opacity-white text on #F46A39 and #E94A1F; full-opacity white fails large-text 3:1 at the lighter stop
- [Opacity-reduced white on coloured backgrounds](feedback_opacity_on_colour.md) — text-white/90 /85 etc. always degrades contrast; flag immediately; use typographic hierarchy instead
- [Icon bubble contrast ratios](project_icon_bubble_contrast.md) — text-whatsapp-icon/bg-whatsapp-soft PASSES at 4.51:1 (fix confirmed); text-coral-press/bg-coral-soft 3.40:1; text-paid/bg-paid-soft borderline 3.05:1
- [Aging bar fill contrast ratios](project_aging_bar_contrast.md) — bg-pending-bar/bg-surface-2 passes at 5.33:1 (fix confirmed); bg-paid borderline 3.06:1; bg-overdue passes 4.60:1
- [role=img vs role=meter for data bars](project_role_img_vs_meter.md) — "share of total" bars use role=img+aria-label; role=meter/progressbar is wrong for this use case
- [text-coral on bg-card contrast fail](project_coral_on_white_contrast.md) — #f46a39 on #ffffff = 3.01:1; fails SC 1.4.3 for normal text; coral-press is darker candidate for fix
- [DataHead missing scope=col](project_table_scope_pattern.md) — TableHead/<th> in all DataTable usage ships without scope="col"; recurring SC 1.3.1 gap; fix is static HTML
- [cursor-pointer inert rows pattern](project_cursor_pointer_inert_rows.md) — DataRow + DataListRow have hover/cursor affordance but no keyboard contract; interactivity deferred; escalates to Critical when onClick lands
