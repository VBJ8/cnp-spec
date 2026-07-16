# CNP — Consent & Negotiation Protocol

**An open protocol for priced, consent-based commercial email.**

CNP lets email recipients publish a machine-readable policy — via DNS, like
SPF and DKIM — describing the terms under which they accept unsolicited
commercial email: whether they accept it at all, what it costs to guarantee
priority delivery, and whether automated negotiation is available.

Senders (or their sending platforms) can check this policy *before* sending,
pay for guaranteed delivery, negotiate terms automatically, or fall back to
a standard queue — instead of guessing whether a message will land in the
inbox or the spam folder.

---

## Why

Email authentication solved "is this sender who they claim to be?"
(SPF, DKIM, DMARC). Nobody solved "did the recipient actually agree to
receive this?"

A previous attempt — Goodmail Systems' CertifiedEmail (2004–2011) — tried to
price inbox access, but controlled pricing and accreditation centrally
through a single company. It collapsed when ISPs pulled out, partly because
senders and users had no real say in the terms.

CNP flips that: **the recipient sets the price and the rules.** There is no
central accreditation authority. Anyone can run their own CNP Policy
Server. The specification is open and free to implement.

## How it works (short version)

1. A recipient's domain publishes a DNS record: `_cnp.example.com`
2. It points to a Policy Server exposing a simple JSON API
3. Senders query that API before sending: pay a fee, negotiate, or queue
4. A signed token records the outcome and travels with the message

Full details in [`SPEC.md`](./SPEC.md).

`SPEC.md` also includes a speculative, non-normative §11 sketching a
possible outbound counterpart — an **Intent Broadcast Protocol (IBP)** —
where a user's own agent could broadcast anonymized purchase intent into
the mesh instead of using open web search. It's recorded as a direction,
not a commitment: nothing there is implemented.

§12 extends that with three further mechanisms — blind sealed matching,
agent-side accountability, and standing (persistent) mandates — designed
so that the resulting discovery flow cannot degrade into a conventional,
pay-for-placement comparison service. These are grounded in the project's
[`botstop-carta-de-diseno.md`](./botstop-carta-de-diseno.md), a design
charter describing botstop's commitment to *endogenous* ethics: rules
that make bad-faith behavior structurally impossible or pointless, rather
than rules enforced after the fact by an external judge.

The current business model — a success-only fee replacing the old access
toll, with a referral royalty mechanism designed to avoid any inflated or
unverifiable payout — is documented separately in
[`MODELO-ECONOMICO.md`](./MODELO-ECONOMICO.md).

## Status

**Draft v0.1.** This is an early-stage proposal, not a finished standard.
It is being developed and reference-implemented by
[botstop.pro](https://botstop.pro), but the specification itself belongs
to no one — that's the point.

Feedback, issues, and independent implementations are welcome.

## Repository structure

```
cnp-spec/
├── SPEC.md                      — the protocol specification (core document)
├── botstop-carta-de-diseno.md   — design charter: endogenous ethics principles
├── MODELO-ECONOMICO.md          — botstop.pro's current business/fee model
├── README.md                    — this file
├── CONTRIBUTING.md              — how to propose changes or implementations
├── LICENSE                      — MIT
└── examples/
    └── minimal-client.js   — minimal sender-side integration example
```

## Relationship to botstop.pro

botstop.pro operates the first production implementation of a CNP Policy
Server and Negotiation Engine. Using botstop.pro is optional — the protocol
works with any compliant implementation. See [`SPEC.md §9`](./SPEC.md#9-reference-implementation)
for reference implementation links.

## License

This specification is released under the MIT License — see [`LICENSE`](./LICENSE).
Anyone may implement, extend, or fork it without restriction or royalty.
