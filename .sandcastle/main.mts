import { run, claudeCode } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

// Simple loop: an agent that picks open issues one by one and closes them.
// Run this with: npx tsx .sandcastle/main.mts
// Or add to package.json scripts: "sandcastle": "npx tsx .sandcastle/main.mts"

await run({
  // A name for this run, shown as a prefix in log output.
  name: "worker",

  // Sandbox provider — runs the agent inside an isolated container.
  // A pnpm store is mounted from the host so packages are downloaded once
  // and reused across runs; npm_config_store_dir points pnpm at it.
  sandbox: docker({
    mounts: [
      {
        hostPath: "~/.cache/sandcastle-pnpm-store",
        sandboxPath: "/home/agent/.pnpm-store",
      },
    ],
    env: {
      npm_config_store_dir: "/home/agent/.pnpm-store",
      // Personal access token for the Supabase MCP stdio server, so the agent
      // can run migrations/advisors headless. Create one at
      // https://supabase.com/dashboard/account/tokens and export it on the host
      // before running sandcastle. The repo's .mcp.json entry authenticates via
      // browser OAuth, which cannot work inside the sandbox.
      ...(process.env.SUPABASE_ACCESS_TOKEN
        ? { SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN }
        : {}),
    },
  }),

  // The agent provider. Pass a model string to claudeCode() — sonnet balances
  // capability and speed for most tasks. Switch to claude-opus-4-8 for harder
  // problems, or claude-haiku-4-5-20251001 for speed.
  agent: claudeCode("claude-fable-5"),

  // Path to the prompt file. Shell expressions inside are evaluated inside the
  // sandbox at the start of each iteration, so the agent always sees fresh data.
  promptFile: "./.sandcastle/prompt.md",

  // Maximum number of iterations (agent invocations) to run in a session.
  // Each iteration works on a single issue. Increase this to process more issues
  // per run, or set it to 1 for a single-shot mode.
  maxIterations: 10,

  // Branch strategy — merge-to-head creates a temporary branch for the agent
  // to work on, then merges the result back to HEAD when the run completes.
  // This is required when using copyToWorktree, since head mode bind-mounts
  // the host directory directly (no worktree to copy into).
  branchStrategy: { type: "merge-to-head" },

  // NOTE: no copyToWorktree for node_modules — the host tree is a macOS
  // pnpm layout (darwin binaries, host store paths), which pnpm inside the
  // Linux container refuses to reuse (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY).
  // The mounted store above makes the in-sandbox install fast instead.

  // Lifecycle hooks — commands grouped by where they run (host or sandbox).
  hooks: {
    sandbox: {
      // onSandboxReady runs once after the sandbox is initialised and the repo is
      // synced in, before the agent starts. Use it to install dependencies or run
      // any other setup steps your project needs.
      // CI=true lets pnpm replace a stale node_modules without a TTY prompt.
      onSandboxReady: [
        { command: "CI=true pnpm install" },
        // Register the token-authenticated Supabase MCP server at user scope.
        // Named supabase-db (not supabase) because the project-scope .mcp.json
        // entry would shadow a same-named user-scope server — and that entry is
        // OAuth-only, which never authenticates headless. Skipped gracefully
        // when no token was exported on the host.
        {
          command:
            '[ -n "$SUPABASE_ACCESS_TOKEN" ]' +
            " && claude mcp add --scope user supabase-db -- npx -y @supabase/mcp-server-supabase@latest --project-ref=lnzsizporrvdzlpxysfd" +
            ' || echo "SUPABASE_ACCESS_TOKEN not set — Supabase MCP unavailable, DB-write issues stay blocked"',
        },
      ],
    },
  },
});
