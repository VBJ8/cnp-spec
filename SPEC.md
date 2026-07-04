# Consent & Negotiation Protocol (CNP)
### Draft Specification — v0.1

**Status:** Draft
**Author:** Vicente (botstop.pro) — reference implementer
**License:** MIT (this specification is free to implement by anyone)

---

## Abstract

The Consent & Negotiation Protocol (CNP) defines an open, DNS-discoverable
mechanism by which email recipients can publish a machine-readable policy
describing the terms under which they accept unsolicited commercial email.
Senders (or their sending platforms) can query this policy before sending,
and optionally engage in an automated negotiation exchange, resulting in a
cryptographically signed token attached to the message.

CNP does not replace spam filtering. It complements it by shifting commercial
email from a unilateral push model to a bilateral, priced, consent-based
exchange — decided entirely by the individual recipient, not by a centralized
accreditation authority.

---

## 1. Motivation

Existing email authentication standards (SPF, DKIM, DMARC) answer the
question "is this sender who they claim to be?" They do not answer "did the
recipient agree to receive this?"

Prior attempts to solve consent economically (e.g. Goodmail Systems'
CertifiedEmail, 2004–2011) failed because:

- Pricing and accreditation were controlled by a centralized third party,
  not the recipient.
- The criteria for "good sender" were opaque and unaudited.
- ISPs had no incentive to remain contractually bound to a private
  certification body.

CNP addresses this by design:

- The recipient — not a platform — sets their own policy and price.
- The specification and reference algorithm are open and auditable.
- Any party can run their own CNP policy server; no dependency on a single
  vendor is required by the protocol itself.

---

## 2. Terminology

- **Recipient**: the owner of an email address publishing a CNP policy.
- **Sender**: any entity (person, company, ESP) wishing to deliver
  unsolicited commercial email to a Recipient.
- **Policy Server**: an HTTP endpoint implementing the CNP Policy API,
  either self-hosted or hosted by a third party on the Recipient's behalf.
- **Negotiation**: an optional exchange in which Sender and Recipient (or
  the Recipient's automated agent) agree on terms of delivery.
- **CNP Token**: a signed artifact proving a negotiation outcome, attached
  to the resulting email message.

---

## 3. Discovery

Discovery follows the SPF/DMARC precedent: a DNS TXT record at a
well-known subdomain.

```
_cnp.<domain> IN TXT "v=cnp1; endpoint=https://negotiate.example.com/api/v1; policy=priced"
```

### 3.1 Record fields

| Field      | Required | Description                                                   |
|------------|----------|----------------------------------------------------------------|
| `v`        | yes      | Protocol version identifier. MUST be `cnp1` for this draft.   |
| `endpoint` | yes      | Base URL of the Policy Server implementing the CNP API.       |
| `policy`   | no       | Hint for senders: `open`, `priced`, `closed`, or `negotiated`. |

If no `_cnp` record is found, Senders MUST treat the Recipient as having
no published policy and fall back to standard delivery practices.

---

## 4. Policy API

### 4.1 Retrieve policy

```
GET {endpoint}/policy/{recipient_email}
```

**Response 200:**

```json
{
  "version": "cnp1",
  "acceptsUnsolicited": true,
  "priorityFeeCents": 500,
  "currency": "usd",
  "negotiationSupported": true,
  "reputationScoreRequired": 60,
  "queueFallback": "async_negotiation"
}
```

| Field                      | Type    | Description                                             |
|----------------------------|---------|----------------------------------------------------------|
| `acceptsUnsolicited`       | boolean | Whether the recipient accepts unsolicited mail at all.  |
| `priorityFeeCents`         | integer | Fee (in minor currency units) for guaranteed priority.  |
| `currency`                 | string  | ISO 4217 currency code.                                 |
| `negotiationSupported`     | boolean | Whether an automated negotiation exchange is available. |
| `reputationScoreRequired`  | integer | Minimum sender reputation score (0–100) to skip the fee.|
| `queueFallback`            | string  | Behavior if sender does not pay: e.g. `async_negotiation`, `reject`, `best_effort`. |

A `404` response indicates no policy exists for that specific address (the
domain may still have a default policy — see §4.3).

### 4.2 Initiate negotiation (optional)

```
POST {endpoint}/negotiate/{recipient_email}
Content-Type: application/json

{
  "senderDomain": "sender.com",
  "senderReputationToken": "...",
  "proposedFeeCents": 200,
  "messageIntent": "sales_outreach"
}
```

**Response 200:**

```json
{
  "status": "accepted" | "countered" | "queued" | "rejected",
  "counterFeeCents": 350,
  "negotiationId": "neg_8x2k...",
  "expiresAt": "2026-07-05T12:00:00Z"
}
```

### 4.3 Domain-level default policy

Recipients MAY publish a domain-wide default at:

```
GET {endpoint}/policy/_default
```

used when no address-specific policy is found.

---

## 5. The CNP Token

Once a negotiation resolves (paid, accepted, or queued), the Policy Server
issues a signed token. The Sender SHOULD attach it as a message header:

```
X-CNP-Negotiation-ID: cnp1; id=neg_8x2k...; sig=<base64 signature>; status=paid_priority
```

### 5.1 Signature

The token is signed using the Policy Server's private key. Public keys are
published via DNS, mirroring DKIM:

```
cnp._domainkey.<domain> IN TXT "v=cnp1; p=<base64 public key>"
```

Any receiving mail client or filter MAY independently verify the token
without contacting the Policy Server again, enabling offline/cached
verification at scale.

### 5.2 Status values

| Status            | Meaning                                                |
|-------------------|----------------------------------------------------------|
| `paid_priority`   | Sender paid the fee; guaranteed delivery/priority.     |
| `negotiated`      | Terms were agreed through automated negotiation.       |
| `queued_free`     | Sender declined to pay; entered fallback queue.        |
| `reputation_waived` | Fee waived due to sender reputation score.           |

---

## 6. Reputation (informative, non-normative in v0.1)

CNP does not mandate a specific reputation algorithm, but recommends that
any Policy Server implementation:

1. Publish the **criteria** used to compute sender reputation scores
   (e.g. negotiation good faith, honored rejections, complaint rate).
2. Avoid opaque, unappealable scoring — senders should be able to see why
   their score changed.
3. Keep reputation **portable in principle**: nothing in this spec
   prevents a sender from presenting reputation data computed by a
   different, independent Policy Server implementation.

A future version of this spec (v0.2) may define a standard reputation
data exchange format.

---

## 7. Security Considerations

- Policy Servers MUST validate that fee amounts charged server-side match
  published policy values; clients MUST NOT be trusted to self-report
  pricing.
- Token signatures MUST use a standard algorithm (e.g. Ed25519) and
  MUST be verifiable without requiring trust in the Sender.
- Replay protection: negotiation IDs MUST be single-use and time-bound
  (`expiresAt`).
- Rate limiting on the negotiation endpoint is RECOMMENDED to prevent
  denial-of-service via mass negotiation requests.

---

## 8. Relationship to Existing Standards

CNP is designed to complement, not replace:

- **SPF / DKIM / DMARC** — answer sender authenticity; CNP answers
  recipient consent and pricing.
- **List-Unsubscribe headers** — CNP can be seen as the inverse:
  "list-subscribe-with-terms" before the first message is ever sent.

---

## 9. Reference Implementation

The reference implementation of both the Policy Server and a client
library for Senders is maintained at:

```
github.com/botstop-pro/cnp-spec        (this specification)
github.com/botstop-pro/cnp-server      (reference Policy Server)
github.com/botstop-pro/cnp-client-js   (Node.js client library)
```

botstop.pro operates the first production Policy Server implementing this
draft and welcomes independent implementations.

---

## 10. Open Questions for v0.2

- Standardized reputation portability format.
- Batch policy lookups for high-volume senders (avoid one HTTP call per
  recipient).
- Formal negotiation state machine beyond accept/counter/reject.
- Whether `_cnp` records should support multiple endpoints for
  redundancy/failover.

---

## Appendix A: Minimal Sender Integration Example

```javascript
async function checkCnpPolicy(recipientEmail) {
  const domain = recipientEmail.split('@')[1];
  const txt = await resolveTxt(`_cnp.${domain}`);
  if (!txt) return { hasPolicy: false };

  const { endpoint } = parseCnpRecord(txt);
  const res = await fetch(`${endpoint}/policy/${recipientEmail}`);
  if (res.status === 404) return { hasPolicy: false };

  return { hasPolicy: true, policy: await res.json() };
}
```

---

*This document is a v0.1 draft, intended for public discussion. Feedback,
issues, and alternative implementations are welcome via GitHub.*
