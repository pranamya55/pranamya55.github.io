Copy this into `src/content/disclosures/<slug>.md`. The filename becomes the URL:
`src/content/disclosures/acme-idor.md` → `https://pranamya.me/disclosures/acme-idor/`

---
title: "Short, specific description of the bug"
summary: "One or two sentences. Shown on the index page and in the RSS feed."
severity: critical        # critical | high | medium | low | informational
status: fixed             # fixed | mitigated | acknowledged | reported | disclosed | wontfix
target: "Protocol or product name"
date: 2026-01-15          # publication date — drives ordering
reportedAt: 2025-12-01    # optional
fixedAt: 2026-01-10       # optional
cve: "CVE-2026-0000"      # optional
cvss: 9.1                 # optional, 0.0–10.0
bounty: "$10,000"         # optional
tags: ["solidity", "evm"] # optional
references:               # optional
  - label: "Vendor advisory"
    url: "https://example.com/advisory"
draft: false              # true hides it from the site entirely
---

## Summary
## Affected code
## Impact
## Proof of concept
## Remediation
## Timeline
