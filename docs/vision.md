# Producer: vision

Producer is a software factory. It takes tickets, hands them to coding agents, and returns work for a human to review. It should fit a small project as well as a large one.

We build it slowly, in small slices. Each slice is a thin, working line through every layer, and later slices build on it.

## Pillars

1. **Modular.** Trackers (GitHub, GitLab), harnesses (Pi first, others later), and later parts all plug in behind small contracts.
2. **Customizable.** Each project chooses its plug-ins and settings in a config file.
3. **Extensible.** Adding a tracker, a harness, or a step should not require rewriting the core.
4. **Memory.** The factory learns, and what it learns is kept.

## Memory

Memory is how the factory improves. Every run should be able to leave behind something the next run can use: what worked, what failed, project conventions, and fixes to its own process. Knowledge should build up across runs instead of being lost when a session ends.

Open questions, to settle in a later slice:

- **Where memory lives.** In git next to the code, in a separate store, or both.
- **What gets remembered.** Per project, per harness, across all projects.
- **How it is written.** By agents during a run, by a review step after a run, or by a human.
- **How it is read.** Loaded into the agent's context (for example through `AGENTS.md`), or retrieved when needed.
- **How it is kept healthy.** Pruning, correcting, and expiring stale knowledge.

Memory is not part of slice 1. Slice 1 should avoid choices that would make it hard to add: each run should leave a record of what happened.
