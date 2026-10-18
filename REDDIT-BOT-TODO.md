# Reddit discovery bot — project TODO

## Goal

Find Reddit posts where someone asks how much an Oktoberfest server is carrying, or posts a relevant stein-carrying clip, and offer the calculator as a useful answer—not as unsolicited promotion.

**Recommended starting point:** build a private, human-reviewed post finder for a short allowlist of subreddits. Do not start with a bot that scans all of Reddit or automatically comments. Text questions are much easier to detect reliably than a GIF whose title says nothing about its contents.

## Phase 0 — Check permission and operating boundaries

### Research findings (checked 2026-10-18)

- **The API has the mechanics needed for a limited bot.** Reddit's API reference documents a subreddit `/new` listing and a `POST /api/comment` endpoint. A top-level post comment requires the OAuth `submit` scope. This establishes that the API has comment functionality; it does **not** establish that Reddit has approved this particular app or promotional use.
- **API access is conditional and can be limited.** The Data API Terms require documented access credentials/OAuth and an honest User-Agent; Reddit reserves the right to enforce request limits. The terms limit data use to the approved use case and prohibit API use to spam users. If a use is not expressly permitted—or is commercial—the terms say a separate agreement is needed.
- **A relevant one-time comment is still a link promotion.** Your desired UX is now: when a post is clearly about the Oktoberfest stein-carrying load, the bot may add one top-level comment with a short description and calculator link. It must never create posts, DM, vote, or reply to comments. This is narrower than broad promotion, but relevance alone does not guarantee Reddit or subreddit permission. Reddit's Rule 2 also requires authentic participation and prohibits spam; moderator approval is essential but does not guarantee Reddit will consider the behavior compliant.
- **“Any post on Reddit” is not a safe initial scope.** Start with a small named subreddit allowlist. Reddit also documents a global `GET /search` endpoint (the `/r/{subreddit}` prefix is optional), so searching text matches across communities may be technically possible. Search is not a complete visual-content detector: a GIF with no useful title/body text will not be found by relevant keywords, and the API docs do not promise exhaustive real-time discovery. Posting is riskier than read-only discovery because each community has its own rules; start comments in a small moderator-approved allowlist. Ask Reddit whether global search for this use case is permitted and what its practical limits are.
- **Community rules remain unverified.** Reddit blocked unauthenticated access to the current `r/theydidthemath` and `r/oktoberfest` rules/API pages during this research. Do not infer permission from that failure. A moderator must confirm whether monitoring and a single relevant calculator comment are acceptable in their community.
- **Account-specific access remains unverified.** Creating an app, obtaining credentials, and confirming any required Reddit approval or separate agreement require the account operator. No account, credential, or approval has been created or tested here.

### Required before implementation/posting

- [ ] Ask Reddit through its current Data API access/support channel whether this exact use—discovering relevant posts and posting at most one context-triggered top-level comment linking to the calculator—is allowed under the current approved-use process, and whether written approval or a separate agreement is required. Do not treat the standard comment endpoint as approval.
- [ ] Ask moderators of each proposed subreddit for explicit permission to monitor posts and have the bot leave one relevant top-level comment. Begin with `r/theydidthemath` only if its moderators agree; add communities one at a time. No permission for one subreddit carries over to another.
- [ ] Confirm access method, credentials/scopes, allowed endpoints, retention rules, and current rate limits from Reddit's current developer documentation and the granted app access.
- [ ] Decide the public bot name, operator/contact route, and privacy notice. Identify it as an automated bot in the comment.
- [ ] Keep the use non-commercial unless Reddit explicitly approves any use that requires separate approval. Do not use Reddit content to train a model without the applicable rightsholders' express permission.

**Proposed action boundary:** one top-level comment per qualifying post, only in moderator-approved communities; no DMs, new posts, votes, comment replies, repeat comments, or broad cross-Reddit scanning. Use a kill switch and stop on any moderator objection or Reddit warning. Do not launch until both platform access/use and each community's posting permission are clear.

**Moderator message draft:**

> Hi moderators — I made a calculator that estimates the load from carrying multiple full beer steins: [calculator URL]. I’m considering a small bot that watches only this subreddit for clearly relevant Oktoberfest/beer-stein carrying posts and leaves at most one short top-level comment with a link and a brief description. It would not create posts, send DMs, vote, reply to comments, or comment on unrelated posts. Would you allow this in your community? Are there conditions or a preferred disclosure/format? I will not enable it here unless you approve, and I’ll stop if you ask.

**Reddit API access question draft:**

> I want to build a small bot for my beer-stein carrying-load calculator ([calculator URL]). The goal is to discover clearly relevant posts, potentially using Reddit's global text-search endpoint, and add no more than one top-level comment to a qualifying post with a short explanation and a link. If global discovery is not permitted or appropriate, I can restrict monitoring and comments to named, moderator-approved subreddits. The bot would not create submissions, send private messages, vote, reply to comments, or contact users otherwise. Is this use permitted under the current Data API terms and access process? Does it require written approval or a separate agreement, and what application/use-case details, endpoints, or limits apply? Please also clarify whether linking to my site counts as commercial or promotional use. [Disclose any monetization or commercial relationship here.]

**Gate:** no Reddit API use or bot comments until the platform's approved-use/access question and per-subreddit moderator permission are resolved. Reddit's terms prohibit API spam and restrict data to the approved use case; moderator permission does not replace Reddit's API approval, and API access does not replace moderator permission.

## Phase 1 — Define the first use case

- [ ] Begin with one explicitly approved subreddit, likely `r/theydidthemath` if its moderators agree. Do not treat "anywhere on Reddit" as the first deployment scope.
- [ ] Define a high-confidence match as an explicit question or clearly described post about an Oktoberfest server carrying multiple beer steins / Maßkrüge and their load. Mere mentions of beer, Germany, or carrying are not sufficient.
- [ ] Treat a media-only post with no clear textual context as uncertain; do not comment automatically on it in the first version.
- [ ] Keep the intended public action minimal: one top-level comment on the post with a brief, factual calculator description and link. State that the estimate depends on assumptions; don't infer exact count, fill, or glass mass from an ambiguous clip.
- [ ] Hard-code the non-actions: never create posts, send DMs, vote, reply to comments, or post a second comment on a post.
- [ ] Set a per-community daily cap and a global kill switch; leave comments disabled in any community without documented permission.

## Phase 2 — Build a read-only detection prototype (before enabling replies)

- [ ] Register an API application using Reddit's documented access flow and store credentials in environment variables or a secrets manager—never in the repository.
- [ ] Monitor only new posts in the configured subreddit allowlist using the permitted API endpoints and rate limits. Start with polling; do not promise real-time detection.
- [ ] Apply transparent, explainable rules first: title/body keywords, common spellings (`Maß`, `Mass`, `stein`, `Oktoberfest`, `server`, `carry`, `weight`), subreddit, and link/media type. Keep thresholds and terms configurable.
- [ ] Do not download or analyze image/GIF/video contents in the first version. Record such posts as “needs human visual review.” Consider image understanding only later, after proving the simpler workflow and separately reviewing permissions, privacy, cost, and accuracy.
- [ ] Produce a private review queue (for example, a daily digest) containing a link, short reason for the match, confidence/category, and proposed response. Do not post comments yet.
- [ ] Let the reviewer dismiss, mark irrelevant, approve a draft, or record a missed match. Use that feedback to improve deterministic rules; do not retain post text longer than needed.
- [ ] Deduplicate by Reddit post ID so polling or restarts do not create repeated candidates.

## Phase 3 — Measure before automating

- [ ] Run read-only for at least a few weeks across the initial allowlist.
- [ ] Track counts of candidates, relevant candidates, missed examples found manually, and reviewer time. Do not store usernames or full post bodies for analytics.
- [ ] Label false positives by cause (beer mentioned but unrelated; unrelated “carry”; non-Oktoberfest steins; title-only ambiguity) and tune rules.
- [ ] Set a minimum precision target for each category before enabling any reply. Keep visual-only posts human-reviewed unless a separately tested approach reaches the target.
- [ ] Ask participating moderators whether the review results and proposed replies are welcome. Stop or narrow monitoring if they object.

## Phase 4 — Single top-level comments (only after approval)

- [ ] Enable automatic comments only in communities where Reddit access/use is approved and moderators have explicitly allowed this behavior. First deployment should be a single approved subreddit.
- [ ] Run the read-only matcher first and review its false positives. Begin comment mode only after the high-confidence rule performs reliably; keep uncertain/media-only matches out.
- [ ] Post at most one short, clearly bot-identified top-level comment per qualifying post. Explain the calculator briefly and link only when relevant; do not claim a precise load based on a clip alone. Avoid identical boilerplate across unrelated threads.
- [ ] Enforce hard safeguards in code: one comment per post, no comment if the post is locked/removed or the bot has already commented, per-community and global daily caps, strict subreddit allowlist, and a global kill switch.
- [ ] Never create posts, send DMs, vote, or reply to comments. Do not contact authors directly.
- [ ] Monitor removals, user reports, moderator feedback, and API errors. Automatically pause comments on any moderator objection, Reddit warning, repeated removals, rate-limit problems, or unexpected behavior.

## Phase 5 — Privacy, reliability, and operations

- [ ] Collect the minimum needed to operate: post ID, subreddit, permalink, detection category, status, and timestamps. Avoid storing usernames, full post text, media, or comment history unless there is a documented need and permitted basis.
- [ ] Define short retention and deletion behavior. Remove queued content when deleted or removed where practical, and honor applicable Reddit deletion requests and API terms.
- [ ] Publish a concise privacy notice for the bot/service describing API access, stored fields, purposes, retention, and contact route, as required by applicable terms and law.
- [ ] Keep secrets out of logs; restrict access to the review queue; log actions and failures without copying post contents.
- [ ] Add health checks, API rate-limit handling, exponential backoff, restart-safe deduplication, and alerts for a stalled watcher.
- [ ] Make the bot easy to pause and shut down; document credential revocation and data deletion steps.

## Suggested architecture (keep it small)

1. **Watcher:** reads new posts from configured communities through Reddit's permitted API.
2. **Matcher:** deterministic rules label direct questions, likely clips, and uncertain cases; it does not post.
3. **Queue and deduplicator:** stores only the minimum review state and prevents repeats.
4. **Reviewer:** lets the operator inspect candidates and approve/dismiss them.
5. **Responder (later):** posts only approved, guarded replies and records the outcome.

Start as one small service with a simple local database and private digest. Avoid adding an LLM, vision model, vector database, or multi-service deployment until observed misses show that a simpler matcher is inadequate.

## MVP acceptance criteria

- [ ] Uses only Reddit-approved API access, documented OAuth scopes, and current rate limits.
- [ ] Watches only an explicit moderator-approved subreddit allowlist; no broad all-Reddit scanning.
- [ ] Read-only trial detects explicit/high-confidence text cases, flags ambiguous/media-only posts, and measures false positives before writing is enabled.
- [ ] Final comment behavior is exactly one top-level comment per qualifying post; no new posts, DMs, votes, or comment replies.
- [ ] Has restart-safe deduplication, per-community/global caps, a strict allowlist, and a tested kill switch before comment mode.
- [ ] The comment identifies the bot, briefly describes the estimate and its assumptions, and links only when the post is clearly relevant.
- [ ] Stores only minimum permitted metadata with a defined short retention policy.
- [ ] No comment mode until Reddit's API-use/access question and that community's moderator permission are both resolved.

## Decisions to make later

- Which one or two communities should be the initial allowlist?
- Is the goal only to answer explicit weight questions, or also to find visual clips that never ask?
- Who will review the daily queue and handle moderator contact?
- What relevance target and reply quota feel useful rather than spammy?
- If human-reviewed replies work, is occasional manual posting sufficient, or is API-based posting worth the operational and policy burden?

**Default recommendations:** one subreddit, read-only mode, text-only matching, human review, no model-generated analysis, and no replies until moderators and the measured results justify them.

## Sources

- Reddit, [Data API Terms](https://www.redditinc.com/policies/data-api-terms), especially §§2.4, 2.6, 2.8–2.9, 3.1–3.2: user ownership and app privacy disclosures; documented OAuth/access information and non-masked User-Agent; discretionary API limits; approved-use restrictions; separate agreement for commercial or otherwise unapproved uses; and prohibition on API spam.
- Reddit, [API reference](https://www.reddit.com/dev/api/), endpoints `GET [/r/{subreddit}/]new`, `GET [/r/{subreddit}/]search`, and `POST /api/comment`. The comment endpoint documents the OAuth `submit` scope and supports a top-level comment when `parent` is a post. Endpoint availability is not permission to use it for this promotion.
- Reddit, [Rules, Rule 2](https://redditinc.com/policies/reddit-rules): participate authentically, follow community rules, and do not spam or engage in disruptive behavior.
- `r/theydidthemath` and `r/oktoberfest` rules were not verifiable in this research session: Reddit denied unauthenticated rules/API access. Contact moderators directly and check the live rules while logged in before adding either community.
