# clientcast

[![npm version](https://img.shields.io/npm/v/clientcast?style=flat-square&color=F3F2EE&labelColor=0B0B0D)](https://www.npmjs.com/package/clientcast)
[![license](https://img.shields.io/badge/license-MIT-F3F2EE?style=flat-square&labelColor=0B0B0D)](LICENSE)
[![node](https://img.shields.io/node/v/clientcast?style=flat-square&color=F3F2EE&labelColor=0B0B0D)](package.json)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-F3F2EE?style=flat-square&labelColor=0B0B0D)](CONTRIBUTING.md)

**Get paid faster for the work you already ship.**

clientcast turns your Git commits into a client update email, delivers it for you, and tells you whether the reply was an approval, real feedback, or a request for additional work — with hours and dollars attached. Built on Claude Code. Free, MIT-licensed, and open source — no clientcast subscription or paid tier.

## Quick start

```bash
npm install -g clientcast

cd path/to/your/project
clientcast init      # asks for client name/email, hourly rate, scope doc
clientcast send      # drafts an update from recent commits and delivers it
clientcast status    # see the client's reply and any scope-creep flags
```

See [Requirements](#requirements) below — the CLI needs the `claude` binary on your PATH (Claude Pro/Max subscription, no API key).

> **Why this exists.** Freelancers and agencies bleed hours on status updates and "can you also..." emails that quietly become unpaid work. clientcast reads your commits, drafts a plain-English update for the client, and when the client replies, Claude tells you whether it was approval, feedback, a concern, or scope creep — with hours and dollars attached.

## What is clientcast?

**clientcast is a command-line tool and MCP server that turns your git commits into an AI-drafted client update email, then reads the client's reply and tells you whether it was an approval, real feedback, or scope creep — with the extra work priced in hours and dollars.**

### Why clientcast

Most client-update tools stop at "here's what changed." clientcast reads the *reply*. When a client says "looks great, can you also add a Spanish version?" it flags that as additional work, estimates it against your scope doc and hourly rate, and hands you a Stripe payment link before you've written a single "sure, that'll be extra" email. That reply-classification-to-invoice loop is the part nobody else does.

### clientcast vs the alternatives

| | clientcast | Manual status emails | PM tools (Basecamp, Trello) | Time trackers (Harvest, Toggl) |
|---|---|---|---|---|
| Drafts the update from your actual commits | Yes | No | No | No |
| Reads the client reply and classifies it | Yes | No | No | No |
| Flags scope creep with hours + dollars | Yes | No | No | No |
| Turns flagged work into a payment link | Yes (Stripe) | No | No | No |
| Runs from your terminal / Claude Code | Yes | — | No | No |

Honest limits: clientcast is not a full PM suite, not an accounting system, and not a CRM. It does one thing — the commit-to-update-to-paid loop — and hands billing off to Stripe.

### When to use clientcast

- You ship client work in git and write status updates by hand
- Clients keep sneaking new work into "quick" replies and you keep eating the cost
- You want scope creep priced the moment it's asked for, not at invoice time
- You already use Claude Code and want the loop drivable from inside a session (MCP)
- You bill hourly or fixed-scope and need a paper trail of what was in scope

### FAQ

**Do I need an Anthropic API key?**
For local CLI use, no — clientcast spawns the `claude` binary and uses your Claude Pro/Max subscription. The hosted viewer needs `ANTHROPIC_API_KEY` because serverless functions can't spawn the CLI.

**How does it decide something is scope creep?**
When a reply arrives, Claude classifies it (approve / feedback / additional-work / concern / mixed). If it's additional work, a second pass estimates hours against your `scope.md` and multiplies by your hourly rate. You see the number; you decide.

**Does the client need an account or login?**
No. They get a no-login link, read the update, comment, and approve in the browser.

**What actually gets uploaded when I send?**
The full update payload — commits, the drafted email, a snapshot of your scope doc, and your hourly rate — goes to a publicly-readable Vercel Blob URL. The URL holds only the update ID, but anyone with the link can read it. Keep secrets out of commit messages and scope docs.

**Can I self-host the viewer?**
Yes. Deploy `viewer/` to your own Vercel project and point clientcast at it with `CLIENTCAST_VIEWER_URL`.

**Is clientcast free?**
Yes. It's MIT-licensed and open source — `npm install -g clientcast`. There's no clientcast subscription or per-seat fee. The only costs are pass-through services you already control: email delivery (Resend, free tier), invoicing (Stripe, per-transaction), and hosting the viewer (Vercel, free tier). Local drafting uses your existing Claude Pro/Max subscription.

**Do I need Claude Code installed to use the CLI?**
Yes. The local CLI spawns the `claude` binary on your PATH to draft updates and classify replies, so Claude Code has to be installed and signed in. That's the design — it keeps your Pro/Max subscription as the only credential, with no separate API key for local use. The hosted viewer is the exception: it can't spawn the CLI, so it uses `ANTHROPIC_API_KEY` directly.

**What languages or stacks does it work with?**
Any of them. clientcast reads your git commit history, not your source code, so it's language- and framework-agnostic — a Rails app, a Next.js site, a Python service, and a static HTML build all work the same way. If it's a git repo, clientcast can draft updates from it.

## What you get

- **`clientcast`** — CLI that reads recent commits and drafts a client update with Claude
- **Auto-email delivery** — `clientcast send` ships the update straight to your client's inbox via Resend (no manual copy-paste)
- **Hosted approval page** — a no-login link your client opens to read, comment, and approve
- **Live preview embed** — point at your Vercel/Netlify deploy and the update page shows the actual site, not just commits
- **Reply classifier** — Claude tags every reply as approve, feedback, additional-work, concern, or mixed
- **Additional-work flagger** — when a reply asks for new work, you get an estimate in hours and dollars based on your hourly rate and original scope doc
- **One-click Stripe invoicing** — when additional work is flagged, click "Approve & invoice" to generate a Stripe payment link, in-page, no leaving the viewer
- **Reply notifications** — Slack webhook or email-back to you the moment your client replies
- **Multi-project dashboard** — `/projects/<token>` lists every update for a project with totals, status, and flagged work in one view
- **`clientcast-mcp`** — MCP server so Claude Code agents can drive the whole loop from inside any session

## Requirements

- Node 20+
- Claude Code CLI installed and signed in (`claude` command on PATH) — uses your Pro/Max subscription, no API key needed for the CLI
- A git repository
- (For email delivery) `RESEND_API_KEY` env var — get one free at [resend.com](https://resend.com). Without it, `clientcast send` still uploads and prints the URL — you just have to email it yourself.

The hosted viewer needs these deployment env vars:
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob) — required
- `ANTHROPIC_API_KEY` — required (the viewer can't spawn `claude` so it hits the API directly)
- `RESEND_API_KEY` — optional, enables reply-notification emails to the developer
- `STRIPE_SECRET_KEY` — optional, enables one-click invoicing on flagged additional work

## Install

```bash
npm install -g clientcast
```

## Quickstart

```bash
cd path/to/your/project
clientcast init
# Project name: Acme Marketing Site
# Client name: Bob
# Client email: bob@acme.com
# Hourly rate: 120
# Scope doc path: ./scope.md

# Make some commits...

clientcast send
# Reading commits...
# Drafting update from 8 commits...
# Uploading...
# ✓ Update ready: https://clientcast-landing.vercel.app/u/8af2k3lq01
# Send this link to Bob for review.

# Bob replies on the page. Then:

clientcast status
# [replied] Acme Marketing Site · 1 scope-creep flag (~$960)
# Reply: "Looks good. Can you also add a Spanish version of the site?"
# [scope_creep · high] Bob
#   Asked for a new Spanish translation, not in original scope.
#   Action items:
#     - Translate site into Spanish
# Scope creep flagged — 1 item, ~$960 total:
# - **[MAJOR]** Add Spanish version of site — ~8h, $960
#   _Translation and copy-flow not in scope.md._
```

## CLI commands

| Command | What it does |
|---|---|
| `clientcast init` | Initialize the project — creates `.clientcast.json` (asks for client info, hourly rate, scope, dev email, preview URL, Slack webhook) |
| `clientcast send [--since <ref>]` | Draft + upload an update from recent commits |
| `clientcast preview` | Same as `send --dry-run` |
| `clientcast list [--all]` | List recent updates |
| `clientcast status [<id>]` | Show status of an update (latest if id omitted) |
| `clientcast export <id> [--format markdown\|email]` | Export as markdown or email format |
| `clientcast config` | Show current project config |

### Useful flags

- `--since <ref>` — git ref or date to start from (default: all commits)
- `--model <sonnet\|opus\|haiku>` — pick model (default `sonnet`)
- `--limit <n>` — max commits to include (default 50)
- `--no-email` — skip auto-delivery, just upload + return URL
- `--from <addr>` — override sender on the email
- `--preview-url <url>` — override the live preview URL embedded in this update

## Reply notifications

Hosted Slack updates are blocked until webhook destinations can be stored privately.
Choose email or `notifyChannel: "none"` in `.clientcast.json` to send hosted updates.
Existing public updates that contain a webhook also reject further saves.
If you previously sent a Slack-enabled update, rotate that webhook: its credential
was included in the public update payload.

When a client replies, Claude classifies the reply server-side and pings you. Pick one channel during `clientcast init`:

- **Slack** — configuration is retained locally, but hosted sends are currently blocked.
- **Email** — provide your dev email. You get a styled HTML email with the reply and flag summary.

If neither is set, replies are silent (you check `clientcast status`).

## Stripe — turn flagged work into paid work

Add `STRIPE_SECRET_KEY` to your viewer deployment, set `stripeEnabled: true` in `.clientcast.json`, and any flagged additional work in the client view gets an "Approve & invoice $X" button. Click it → Stripe payment link generated → client pays → you get notified by Stripe. The flag stores the `paymentLink` so reloading the page shows a "Pay $X →" CTA instead.

This is the closed loop: `git commit` → AI summary → client reply → flagged work → payment link → money in bank.

## Multi-project dashboard

Every project gets a unique `projectToken` at init. Visit `<viewerUrl>/projects/<token>` to see every update for that project — status, flagged work totals, reply counts. Bookmark it for clients you have ongoing work with.

## MCP server — drive clientcast from Claude Code

Add this to `~/.claude.json` under `mcpServers`:

```json
{
  "mcpServers": {
    "clientcast": {
      "type": "stdio",
      "command": "clientcast-mcp"
    }
  }
}
```

Restart Claude Code. From inside any session you'll have 5 tools:

- `client_init({ projectName, clientName, clientEmail, hourlyRate, scope? })`
- `client_send({ since?, model?, dryRun? })`
- `client_status({ updateId? })`
- `client_list({ limit?, all? })`
- `client_export({ updateId, format? })`

Now Claude can wrap up your work and ping the client without leaving the editor.

## How it works

1. CLI reads commits via `simple-git` (with stats: files changed, insertions, deletions)
2. Spawns `claude` subprocess with a draft-update prompt that includes commits + your scope doc
3. Saves the update payload (commits + draft + scope doc snapshot + hourly rate snapshot) to Vercel Blob
4. Hosted viewer at `clientcast-landing.vercel.app/u/<id>` renders the update with a reply form
5. Reply submission hits the viewer's API route → Anthropic API classifies it → if scope creep is detected, the flagger runs against the saved scope doc → cost estimate added to the payload
6. `clientcast status` reads back the updated payload

The viewer uses the Anthropic API directly (server-side env var) because Vercel functions can't spawn the `claude` binary. The CLI uses the subprocess to keep your Pro/Max subscription as the only credential needed for local use.

## Privacy

By default everything is local until you `send`:
- Config lives in `.clientcast.json` in your project
- Local copies of past updates live in `~/.clientcast/updates/`
- Nothing leaves your machine until you run `clientcast send`

When you send, the **entire update payload** (commits + draft + scope doc + hourly rate) is uploaded to a **publicly readable** Vercel Blob URL. The shareable URL contains only the update ID — but anyone with the URL can read the payload. Don't include secrets in commit messages or scope docs.

## Self-hosted viewer

Deploy `viewer/` to your own Vercel project:

```bash
cd viewer
vercel --prod
```

Then set on the deployment:
- `BLOB_READ_WRITE_TOKEN` — from your Vercel Blob store
- `ANTHROPIC_API_KEY` — from console.anthropic.com

And point clientcast at it:

```bash
export CLIENTCAST_VIEWER_URL=https://your-deployment.vercel.app
clientcast init
```

## Development

```bash
git clone https://github.com/nikolas-sapa/clientcast
cd clientcast
npm install
npm test
npm run build

# CLI dev
npm run dev -- send --dry-run

# Viewer dev
npm run viewer
```

## Contributing

Bug reports, feature requests, and PRs are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for dev setup, repo layout, and PR expectations. Please also read the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues should go to niksapa150@gmail.com, not a public issue — see [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE). clientcast itself is free and open source; the only costs are pass-through services you choose to enable (Resend, Stripe, Vercel).
