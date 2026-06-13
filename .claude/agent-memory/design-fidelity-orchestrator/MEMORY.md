# Memory index

- [Notifications tone type defer](project_notifications_tone_type.md) — NotificationTone is duplicated locally in Units 4 & 5; Unit 13 must unify into src/lib/types/notifications.ts and refactor both consumers
- [Lekka home build SUPERSEDED](project_lekka_home_build.md) — old phone-mock hero + 3-phone showcase is replaced by browser-mock hero + laptop+phone showcase; treat existing src/components/home/* as scaffolding to rewrite, not resume
- [Skeleton kit](project_skeleton_kit.md) — per-page loading-skeleton batch: shared kit in ui/custom (shimmer/table/page-header), decomposition + loading.tsx convention, local-duplicate column descriptors, deferred TopbarSkeleton extraction
- [SkeletonTopbar header landmark (deferred)](project_skeleton_topbar_header_landmark.md) — shared SkeletonTopbar uses real <header>; a11y wants <div>/role=none; latent (aria-hidden today), fix only in a kit-level a11y pass — never auto-fix per-unit
- [Skeleton aria-hidden → no landmarks](feedback_skeleton_aria_hidden_no_landmarks.md) — inside aria-hidden skeleton subtree use plain <div>, NOT <aside>/<section>; reject reviewer "DOM parity" requests for landmark elements (a11y ruling, activity unit)
