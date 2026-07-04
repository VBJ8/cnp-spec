# Contributing to CNP

CNP is meant to be an open, community-shaped protocol, not a single
company's product spec with a permissive license slapped on top. If it
only ever reflects botstop.pro's implementation choices, it isn't really
open — contributions and disagreement are the point.

## Ways to contribute

- **Read `SPEC.md` and open issues** for anything ambiguous, underspecified,
  or that seems to favor one implementer unfairly.
- **Propose changes** via pull request against `SPEC.md`. Significant
  changes should be discussed in an issue first.
- **Build an independent implementation** (Policy Server, client library,
  mail client integration) and link it back here. Independent
  implementations are the strongest signal that this is a real protocol
  and not vendor lock-in with extra steps.
- **Report real-world friction**: if you try to implement CNP and something
  in the spec doesn't survive contact with reality, that's valuable
  feedback even without a proposed fix.

## Versioning

- `v0.x` drafts may change incompatibly between minor versions.
- Once a version reaches `v1.0`, breaking changes will go through a formal
  deprecation process (to be defined before v1.0 ships).

## Design principles to keep in mind

Changes should be evaluated against the core principles in `SPEC.md §1`:

1. The **recipient**, not a central authority, controls their own policy
   and pricing.
2. The specification and any reputation criteria must be **open and
   auditable** — no opaque scoring.
3. **No implementation should be required** to use CNP. Anyone should be
   able to run their own Policy Server without depending on botstop.pro
   or any other single provider.

Proposals that concentrate control in a single implementer, even
unintentionally, should be treated with extra scrutiny.

## Code of conduct

Be respectful, assume good faith, and keep disagreements focused on the
technical merits. Standard open-source etiquette applies.
