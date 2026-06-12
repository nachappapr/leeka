---
name: project-zod-input-output-split-and-resolver-cast
description: Zod 4 .default() creates input≠output split; as Resolver<DraftFormData> cast masks it; canonical fix is explicit DraftFormData type param to standardSchemaResolver
metadata:
  type: project
---

Zod 4's `$ZodDefault` wraps a field so its **Input** type is `T | undefined` while its **Output** type is `T`. For `DraftFormSchema`, the `discount` field uses `.default(0)`, so:

- `z.input<typeof DraftFormSchema>` → `discount?: number | undefined` (optional in form values)
- `z.infer<typeof DraftFormSchema>` (= Output) → `discount: number` (required)

`standardSchemaResolver<Input, Context, Output>` infers `Input` from the schema's `~standard.types.input`, which is the _input_ type — so the returned `Resolver<Input>` is typed on the optional version, not `DraftFormData` (the output). The `as Resolver<DraftFormData>` cast suppresses a genuine type gap rather than fixing it.

**Canonical fix:** pass the explicit type parameter to `standardSchemaResolver`:
```ts
standardSchemaResolver<DraftFormData>(DraftFormSchema)
```
This narrows `Input` to `DraftFormData` directly, eliminating the need for the cast.

**Why this matters:** the `as` cast hides the fact that RHF's `handleSubmit` callback receives `DraftFormData` (output) but the form's internal field types may be inferred as the optional input — a silent contract mismatch.

**How to apply:** flag `as Resolver<DraftFormData>` on any form where the schema has `.default()` fields; prescribe the explicit type-param fix, not the cast.

See: [[project-scope-creep-test-unit-schema-change]]
