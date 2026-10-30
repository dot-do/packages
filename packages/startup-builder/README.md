---
name: startup-builder
version: 0.3.0
description: "The command line and MCP server for api.sb: an agent's queue (queue, claim, prompt, show, close, renew, release), worklists, versions and revert, in a compact grammar; the local work loop."
license: MIT
keywords:
  - agents
  - api.sb
  - claude-code
  - cli
  - mcp
  - queue
  - startups
  - worklist
downloads:
  monthly: 231
published: "2025-12-17T19:56:37.744Z"
updated: "2026-10-10T12:28:45.221Z"
---

# startup-builder


The command line for [api.sb](https://api.sb), with an optional local MCP server. Agents use it to take work from the queue: see open batches, claim one, read its prompt, close its Tasks, and give back what is left. The grammar is in `docs/grammar.md` in the source repository (a sketch).

Requires Node.js 20 or newer. Start by signing in and reading a business:

```sh
npx startup-builder --help
npx startup-builder login
npx startup-builder whoami
npx startup-builder show /headless.ly --json
npx startup-builder help do
```

`login` opens id.org.ai in your browser; `login --device` supports terminals without a local browser. Use `--json` where the command's help offers it for structured output.

`npx startup-builder` can use a locally installed version. Use `npx startup-builder@latest` to explicitly select the stable release channel, or an exact version to reproduce an earlier run. Keep a resolved version for a long-running assignment; new sessions can pick up releases.

Once assigned work, an agent can use the queue:

```sh
npx startup-builder queue for:tom
npx startup-builder claim
npx startup-builder prompt
npx startup-builder close 1 --body r1.json
npx startup-builder release
```

Inside a claimed batch, `close <n>` runs in do Mode with the lease's own token. Every write is versioned, so `versions <ref>` and `revert <ref> --to <v>` undo it.

In claude-runner's container the dispatcher holds the claim: with `SB_BATCH` set and no local lease, the CLI builds the lease in memory from `GET <SB_BATCH>` and never writes it; `renew` and `release` are the dispatcher's. A 409 `lease_ended` means stop (exit 4).

The Owner steers the loop by editing its prompts: `startup-builder prompt coordinate-review --set new.md` writes the next version (versioned and revertible; a lease token is refused, and so is `--set` inside a batch).

`--api` (and the other global options) go before the command: `startup-builder --api <url> show 1`. Inside a batch (`SB_BATCH` set) the API is the batch's own: `--api` is refused, and so is an `SB_API` on another origin.

## Hosted MCP with OAuth

Connect your agent host to `https://api.sb/mcp` using Streamable HTTP and sign in with id.org.ai through that host. No local CLI process is required. For Claude Code:

```sh
claude mcp add --transport http sb https://api.sb/mcp
```

Then use `/mcp` to authenticate. For Codex, configure the server and authenticate:

```sh
codex mcp add sb --url https://api.sb/mcp
codex mcp login sb
```

The hosted server exposes `search`, `fetch` and `do`. Fetch `/$.d.ts` for the current types; `do` executes TypeScript against `$`, for example `return await $.search('headless.ly')`. Check runtime limitations in the returned definitions. Connecting MCP does not automatically supply an agent's operating instructions or Objectives.

CLI `do` instead takes a noun verb and a target. The interfaces share api.sb but do not expose identical tools. Hosted HTTP with OAuth is the integration path for remote and web agents; validate it independently of local stdio.

## Optional local MCP over stdio

The CLI's queue verbs are available as MCP tools (`queue`, `claim`, `prompt`, `show`, `close`, `renew`, `release`, `worklist`, `versions`, `changes`), with the same compact answers:

```sh
claude mcp add startup-builder -- npx -y startup-builder mcp
# with a bearer instead of the stored sign-in:
claude mcp add startup-builder -e SB_TOKEN=… -- npx -y startup-builder mcp
```

Authentication works the same as the CLI: `SB_TOKEN`, else the stored sign-in (`startup-builder login`), and for the claimed batch its lease. Leases live in `~/.config/startup-builder/leases/` (mode 0600), shared by the CLI and the MCP server.

The Owner's tools are off by default. `startup-builder mcp --owner` adds `revert` and `prompt`'s `set` (a Prompt's next version), acting with the stored sign-in; without it a client holding the server can do neither.

```sh
claude mcp add startup-builder-owner -- npx -y startup-builder mcp --owner
```

## Run a worker loop

`work` claims the next batch, hands its prompt to an agent, renews the lease while it works, and releases the batch when the agent exits. Unclosed Tasks go back to the queue. Then it claims the next batch.

```sh
npx startup-builder work --agent claude --for scout           # loop until the queue is empty
npx startup-builder work --agent claude --once                # one batch
npx startup-builder work --agent claude --wait --max-batches 20
npx startup-builder work --agent claude --max-minutes 45        # a batch's wall-clock cap (default 30)
npx startup-builder work --agent print                        # print the prompt; a person or another harness closes the Tasks
```

- **`--agent claude`** runs the local Claude Code non-interactively (`claude -p`, stream-json), on the account `claude` is logged into, a Max subscription. Its environment loses API keys, gateway and cloud-provider switches (`ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `ANTHROPIC_CUSTOM_HEADERS`, Bedrock, Vertex, Foundry, AWS credentials), other bearers (`SB_RUNNER_TOKEN`) and your lease directory.
  - The model is `claude-opus-5-5` (`DEFAULT_MODEL` in `src/next/models.ts`); `--model` overrides it.
  - Its tools are scoped: the batch subcommands of this CLI (`close`, `show`, `prompt`, `versions`), files in its own working directory, and web reads. `run`, `work`, `login`, `logout`, `claim`, `renew`, `release`, `revert`, `do` and anything else are denied.
  - It is isolated from the machine: `--restricted` ignores your own Claude Code settings (allow rules, auto mode) and keeps file tools inside its working directory, `--strict-mcp-config` loads none of your MCP servers, and `--permission-mode dontAsk` denies anything not allowed.
  - What it runs is out of its reach. Each batch gets two temp directories side by side: `sb-work-*`, its working directory, and `sb-home-*` (mode 0700), holding the `startup-builder` it finds first on its PATH (read-only, in a read-only directory) and its own config directory (`XDG_CONFIG_HOME`) with only its batch's lease. Its file tools cannot rewrite the CLI it runs, and its CLI cannot read or remove your sign-in or your other leases. Both directories are deleted when the batch ends.
  - The lease token reaches it only as `SB_TOKEN` in its environment, never in the prompt or on a command line.

### Isolation: what a batch agent can and cannot do

Inside a batch (`SB_BATCH` set) the CLI holds to the batch:

- **One API.** The lease token is bound to the API its batch was claimed on, and the stored sign-in to the API it was issued for: neither is sent anywhere else. `--api` is refused, and so is an `SB_API` on another origin.
- **One directory.** `close --body <file>` reads only a regular file inside the agent's working directory (`SB_WORKDIR`), by its real path: no `..`, no absolute path elsewhere, no symlink out. Anything else is refused before it is read. `--body -` reads stdin.
- **No lease management.** `renew` and `prompt --set` are refused; the loop renews the lease, and never past its own wall-clock cap (`--max-minutes`, default 30), when it stops the agent and releases the batch.

**Accepted risk: the agent holds its own lease token.** It is `SB_TOKEN` in the agent's environment. Its file tools no longer reach the lease copy and its Bash runs only the batch subcommands, but treat the token as readable by the agent: it keeps web reads (WebFetch, WebSearch), which research needs, so an agent that got hold of the token could carry it off in a URL. The damage is bounded instead of prevented: the token reaches one batch (its Tasks, for as long as the lease, at most the wall-clock cap), the CLI will not send it to any other origin, and every write it can make on api.sb is versioned and revertible (`versions`, `revert`).
- **`--agent codex`** runs `codex exec -` with the prompt on stdin, the same scrubbed environment (including `OPENAI_API_KEY`: codex uses its own `codex login`) and its own config directory. None of the Claude isolation flags apply: codex's own sandbox and config decide what it may run.
- **Logs:** each batch writes one compact line per event to stdout, and the agent's stream-json to `~/.config/startup-builder/logs/`. Ctrl-C releases the batch before exiting.

`run --cloud for:<worker>` hands a Worker's worklist to claude-runner. There is no local `run`: a local agent runs through `work`.

On Cloudflare the same loop runs without a laptop. claude-runner's dispatcher claims batches and runs each in a Sandbox container, on a pooled Max token that is added only at egress.

With 15 Max accounts, run one `work` per logged-in account (one machine or container each). Each claims its own batches, and a 409 on a batch someone else just took moves it on to the next.

## Library

`import { Api, Session, work } from 'startup-builder'` uses the same client and work loop as the CLI.

### Migrating from 0.2

0.3 replaces the Foundation Sprint interface with the api.sb CLI. The former Sprint commands and state-machine exports have been removed; there is no `startup-builder/machines` export. Applications using 0.2's library API must migrate before upgrading. The current exports are listed in the package's TypeScript declarations.

The client sends its bearer only to the API's own origin (https, or http on loopback). A URL on another origin is read without it, and a write to one is refused.
