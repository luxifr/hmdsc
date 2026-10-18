# Reddit discovery bot — project TODO

## Goal

Find Reddit posts where someone asks how much an Oktoberfest server is carrying, or posts a relevant stein-carrying clip, and offer the calculator as a useful answer—not as unsolicited promotion.

**Recommended starting point:** build a private, human-reviewed post finder for a short allowlist of subreddits. Do not start with a bot that scans all of Reddit or automatically comments. Text questions are much easier to detect reliably than a GIF whose title says nothing about its contents.

## Phase 0 — Check permission and operating boundaries

- [ ] Review Reddit's current Data API Terms, Developer Documentation, User Agreement, and each target subreddit's rules before creating the app. Recheck before launch; Reddit's terms and API access can change.
- [ ] Confirm what API access and rate limits apply to this exact use case and obtain the required credentials/approval. Do not scrape pages or work around API restrictions if access is unavailable.
- [ ] Decide who operates the bot, how it will be identified, and how users or moderators can contact the operator.
- [ ] Ask moderators of each intended subreddit whether monitoring and, later, occasional bot replies are welcome. Respect subreddit-specific rules and removals; an API credential is not permission to post in every community.
- [ ] Keep the use non-commercial unless Reddit has explicitly approved any use that requires separate approval. Do not use Reddit content to train a model without the applicable rightsholders' express permission.
- [ ] Write down an acceptable-use policy: no DMs, no votes, no replies to users who do not want them, no repeated promotion, and no evasion of moderator or user blocks.

**Gate:** stop if API access, terms, subreddit rules, or moderator feedback do not support the planned monitoring/reply behavior. Reddit's Data API Terms prohibit using the API to spam users and limit content use to the approved use case; treat this as a product constraint, not a launch-time formality.

## Phase 1 — Define the first use case

- [ ] Start with a small, explicit subreddit allowlist (for example, `r/theydidthemath` only after checking its current rules and moderator preferences).
- [ ] Define separate detection cases:
  - **Direct question:** text/title asks how much weight, how many steins, or what load is being carried.
  - **Likely relevant clip:** title/body/link mentions Oktoberfest, a server/waitress, Maß/stein, or carrying multiple beers.
  - **Visual-only candidate:** the post is a GIF/video/image with little useful text. This is a review candidate, not an automatic match.
- [ ] Decide the useful response: link to the calculator, optionally state what it estimates, and make clear that results depend on user-adjustable assumptions. Do not claim an exact weight from a clip when count, fill, or glass mass cannot be established.
- [ ] Choose initial limits: maximum posts reviewed per day, reply frequency, quiet hours, and what to do when the bot/operator is unavailable.

## Phase 2 — Build a read-only, human-reviewed MVP

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

## Phase 4 — Carefully limited replies (only after approval)

- [ ] Enable replies only in moderator-approved subreddits and only for high-confidence direct questions. Keep all other matches in the human queue.
- [ ] Require a human to approve every reply at first. Consider full automation only after an extended, measured trial and explicit moderator acceptance.
- [ ] Use one short, non-repetitive reply per post, clearly identify the bot, answer the question before linking, and include the calculator only when genuinely relevant. Avoid copy-pasting the same promotional comment across communities.
- [ ] Enforce hard safeguards in code: one reply per post, no reply if locked/removed/already answered by the bot, per-community and global daily caps, moderator allowlist, opt-out/disable list, and a global kill switch.
- [ ] Never reply to comments, message users, vote, or contact authors directly in the MVP.
- [ ] Monitor removals, user reports, moderator feedback, and API errors. Automatically pause replies on repeated removals, rate-limit problems, or unexpected behavior.

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

- [ ] Uses only approved Reddit API access and respects documented rate limits.
- [ ] Watches only an explicit subreddit allowlist; no broad all-Reddit scanning.
- [ ] Detects direct text questions and queues ambiguous/media-only posts for a human.
- [ ] Generates no automatic comments, votes, or DMs.
- [ ] Deduplicates posts across polling and restarts; has a tested pause switch.
- [ ] Reviewer can explain why each candidate was surfaced and report false positives/misses.
- [ ] Stores only documented minimum metadata with a defined short retention policy.
- [ ] Read-only trial meets the chosen relevance target and moderators approve any next step before replies are enabled.

## Decisions to make later

- Which one or two communities should be the initial allowlist?
- Is the goal only to answer explicit weight questions, or also to find visual clips that never ask?
- Who will review the daily queue and handle moderator contact?
- What relevance target and reply quota feel useful rather than spammy?
- If human-reviewed replies work, is occasional manual posting sufficient, or is API-based posting worth the operational and policy burden?

**Default recommendations:** one subreddit, read-only mode, text-only matching, human review, no model-generated analysis, and no replies until moderators and the measured results justify them.

## Sources

- Reddit, [Data API Terms](https://www.redditinc.com/policies/data-api-terms): access is conditional on compliance; content is user-owned; requires appropriate privacy disclosures; restricts use beyond the approved use case and use of the API to spam, incentivize, or harass users; notes separate approval may be required for uses not expressly permitted.
- Reddit, [API reference](https://www.reddit.com/dev/api/): documented API endpoints. Confirm current authentication, endpoint availability, and rate limits during Phase 0; this roadmap does not assume global discovery is available.
