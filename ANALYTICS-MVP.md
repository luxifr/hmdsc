# Privacy-first analytics MVP

## Recommendation

Use **GoatCounter's hosted service** for an initial, low-maintenance trial. It is a small, open-source analytics product with a free, donation-supported hosted option; its servers are documented as being in Finland and Germany. This avoids operating an analytics server, database, backups, upgrades, and monitoring ourselves.

This is a practical compromise, not a claim that third-party analytics is invisible or legally consequence-free: the visitor's browser contacts GoatCounter to report a page view. GoatCounter's published privacy policy says it does not store IP addresses or full User-Agent strings in its database, but it temporarily holds the site/IP/User-Agent combination in memory for up to eight hours to deduplicate visits. Optional individual-pageview collection is disabled by default. Verify the account settings against the current documentation before launch.

If even that brief processing or third-party request is unacceptable, use **no browser analytics** for the MVP. Basic first-party web-server request counts are an alternative, but normal server logs can retain IP addresses, full URLs, and referrers unless deliberately configured and rotated; it is not automatically more private or less work.

## What to measure

Start with only data that answers concrete product questions:

1. **Aggregate page visits over time** — is the site being used?
2. **`calculator_used` event** — did a visit interact with at least one calculator input?
3. **`share_clicked` event** — are visitors using the share feature?

Send each event at most once per page load. Use fixed event names only. Do not send event properties, exact calculator values, stein count, fill level, custom assumptions, this site's query string or URL fragment, or user-provided text. The tracker sends `location.pathname` for this site's page and the referring URL reported by the browser; the page title is suppressed. Scenario values in legacy query links are captured for the calculator and immediately moved into a URL fragment; new share links use fragments. URL fragments are not sent in HTTP requests, so new share links keep values out of hosting and analytics query strings. Legacy query links necessarily include the values in the initial request to the site host, but they are removed before the GoatCounter script loads. Referrer URLs may include paths or query parameters from the referring site, subject to that site's and the browser's referrer policies; this is accepted to measure referral sources.

Do not enable cross-site tracking, persistent visitor IDs, session replay, heatmaps, fingerprinting, advertising pixels, or enrichment. The current GoatCounter account has sessions, referrer, User-Agent, screen-size, and country collection enabled. GoatCounter derives browser and operating-system categories from the User-Agent, stores screen width (not full screen dimensions), and derives country-level location from the request IP. The site sends the browser-reported referrer, as permitted by the referring site's and browser's referrer policies. GoatCounter says it temporarily holds the site/IP/User-Agent combination in memory for up to eight hours to identify repeat visits; it says raw IP addresses and full User-Agent strings are not stored in its analytics database. This transient processing is separate from browser cookies or storage, which its tracker does not use.

## Visitor experience

- No cookie banner or consent interaction is part of this MVP.
- Add a short, non-blocking footer note linking to a concise privacy explanation. Suggested wording, to use only after confirming the configuration:

  > GoatCounter analytics: visits, sessions, browser/OS categories, screen width, country-level location, and referring URLs. Calculator values are not sent. [Analytics & privacy]

- The linked explanation should identify GoatCounter, state the collected categories and purposes, describe the provider's handling of session identifiers and raw IP/User-Agent data, give a contact route, and say that no exact calculator values are sent.
- Do not describe the analytics as anonymous or promise that no personal data is processed unless the deployed configuration and applicable legal review support that wording. A no-cookie setup and a no-banner choice do not automatically remove transparency obligations.

## Setup and operational effort

1. Create a hosted GoatCounter site/account; the hosted service requires an email address for the site owner's account.
2. Add its small deferred script to the source page (not only the generated `dist/index.html`; the build inlines source HTML).
3. The site tracker sends this site's pathname and the browser-reported referrer, suppresses the page title, and omits this site's query string. Legacy query-based scenario links are converted to fragment-based links before the analytics script loads; newly shared links also use fragments. The current account enables sessions, referrers, User-Agent, screen-size, and country collection; the footer disclosure names these collected categories. Recheck the live dashboard settings if these change.
4. The site sends the two fixed events above, once per page load each, without properties or raw values.
5. Check the live dashboard with a test visit. Verify that a URL like `/?count=6&fill=90` is recorded only as `/`, that no event contains input values, and that browser storage contains no analytics cookie or identifier.
6. The site footer contains a small expandable analytics explanation; review its wording against the final service settings before public launch.

Hosted service means no server patching, database administration, or backups for us. The trade-off is relying on a third-party provider and its policy, availability, and continued free hosted offer. Export the aggregates periodically if they become important. If requirements or scale change, GoatCounter can also be self-hosted, but that adds deployment, updates, database and backup responsibilities; it is not the MVP recommendation.

## Scope and decision checks

Proceed only if the following hold:

- The hosted service remains free for this site's intended use, or the owner explicitly approves its cost.
- Its current terms and data-processing setup are acceptable for the site's operator and audience.
- The tracker can omit query strings and disable unnecessary dimensions/logs.
- The page's privacy note accurately reflects the final configuration.

If any check fails, omit analytics for now rather than silently adding a more invasive provider. Revisit after there is a specific unanswered product question that the minimum dataset cannot answer.

## Sources

- GoatCounter, [product overview](https://www.goatcounter.com/): open-source project, free donation-supported hosted option, self-hosted option, and stated analytics features.
- GoatCounter, [privacy policy](https://www.goatcounter.com/help/privacy): stored aggregate data, optional dimensions, ephemeral IP/User-Agent handling, cookies/storage, provider and server locations, account and backup notes.
- GoatCounter, [sessions and visitors](https://www.goatcounter.com/help/sessions): visit counting and the in-memory site/IP/User-Agent mapping used for up to eight hours.
- GoatCounter, [control the path sent to GoatCounter](https://www.goatcounter.com/help/path): documentation for stripping query parameters by sending a custom path.
- GoatCounter, [GDPR consent notices](https://www.goatcounter.com/help/gdpr): the provider's own qualified view that a consent notice may not be required; it explicitly notes uncertainty, national differences, and that it is not legal advice. Treat this as the provider's position, not a legal determination for this site.
- Umami, [pricing](https://umami.is/pricing): current hosted Hobby tier lists $0/month, one website, up to 100,000 events/month and six-month retention; it is a fallback if GoatCounter is unsuitable, but involves a different vendor and data-processing arrangement.
- European Union, [GDPR, Article 13](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng): transparency information where personal data is collected.
- Germany, [TDDDG §25](https://www.gesetze-im-internet.de/ttdsg/__25.html): rules on storing information on, or accessing information from, a user's terminal equipment. This is not limited to cookie banners; determine applicability from the actual implementation.
