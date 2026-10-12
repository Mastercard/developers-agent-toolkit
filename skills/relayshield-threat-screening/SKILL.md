---
name: relayshield-threat-screening
description: >-
  Threat-intelligence screening for Mastercard API operations and agentic
  payment flows. Checks merchants, URLs, wallet addresses, and email
  addresses against 700K+ threat indicators before the agent executes a
  transaction. Use when validating a payee, screening a merchant, or
  verifying transaction safety in Agent Pay flows.
  Trigger phrases: "is this merchant safe", "screen this transaction",
  "check this payee", "threat check", "fraud check", "verify merchant".
---

# RelayShield Threat Screening for Mastercard

## When to use

Call RelayShield **before** executing a Mastercard API operation that involves:
- A merchant or payee the agent has not transacted with before
- A URL from an untrusted source (invoice, email, chat)
- A wallet address for crypto/stablecoin settlement
- Any Agent Pay flow where the agent is acting autonomously

This is the security layer that complements Mastercard's identity layer:
Mastercard verifies *who* the agent is; RelayShield verifies *whether it's safe*.

## API

Base URL: `https://api.relayshield.net/v1`

All endpoints accept POST with JSON body. No signup required for free checks.

### Screen a URL

```bash
curl -X POST https://api.relayshield.net/v1/check/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://merchant-example.com/pay"}'
```

Response:
```json
{
  "verdict": "flagged",
  "confidence": 0.87,
  "cause_codes": [
    {"code": "TI_PHISHING_KIT", "detail": "URL matches known phishing kit infrastructure"}
  ]
}
```

Verdicts: `clean` | `flagged` | `blocked`

### Screen a wallet address

```bash
curl -X POST https://api.relayshield.net/v1/check/wallet \
  -H "Content-Type: application/json" \
  -d '{"wallet": "0x...", "chain": "ethereum"}'
```

### Screen an email

```bash
curl -X POST https://api.relayshield.net/v1/check/email \
  -H "Content-Type: application/json" \
  -d '{"email": "merchant@example.com"}'
```

### Verify transaction intent (TAP)

For Agent Pay flows, verify the transaction matches the user's authorized intent:

```bash
curl -X POST https://api.relayshield.net/v1/tap/verify \
  -H "Content-Type: application/json" \
  -d '{
    "intent": {"merchant": "...", "amount": 100, "currency": "USD"},
    "transaction": {"merchant": "...", "amount": 100, "currency": "USD"}
  }'
```

Returns `match: true/false` with details on any mismatch (e.g., amount changed, merchant swapped by prompt injection).

## Integration pattern

In your agent flow:

1. Agent proposes a Mastercard API operation (e.g., create payment)
2. Extract merchant URL, payee details from the operation parameters
3. Call RelayShield `/v1/check/*` endpoints
4. If verdict is `blocked`, halt and ask the user
5. If verdict is `flagged`, surface the cause codes and ask for confirmation
6. If verdict is `clean`, proceed with the Mastercard API call

## MCP Server

RelayShield also provides an MCP server for direct tool integration:
- Registry: `io.github.nzdsf2-gif/relayshield-free-mcp`
- URL: `https://relayshieldadmin-relayshield-free-mcp.hf.space/mcp`

## Rate limits

Free tier: 100 checks/day. No API key required.
For higher volume, see https://api.relayshield.net/developers
