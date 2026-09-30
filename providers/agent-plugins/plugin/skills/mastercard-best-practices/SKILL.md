---
name: mastercard-best-practices
description: >-
  Integration guidance for Mastercard APIs. Covers resolving a service's
  ID from its name, confirming a service's auth type before writing auth
  code, routing to the right authentication guide, finding an operation's
  request and response schema, sandbox versus production base URLs, and
  what Mastercard's error responses actually mean when authentication fails.
  Use when building, debugging, or reviewing code that calls a Mastercard API.
  Trigger phrases: "add Mastercard", "Mastercard API", "call a Mastercard
  endpoint", "write code to call", "OAuth 1.0a signing", "getAuthorizationHeader",
  "401 from Mastercard", "invalid signature", "consumer key", "signing key",
  "Mastercard sandbox", "Open Finance".
---

# Mastercard APIs Integration Guide

## Source of truth

The Mastercard Developers MCP server (`@mastercard/developers-mcp`, hosted at
`https://developer.mcp.mastercard.com`) is authoritative for which services
exist, what an endpoint accepts, and what the integration guides say. Call it
rather than answering from memory.

`get-documentation` also returns the
service's `api_specification(s)` paths, which supply the required argument for
both operation tools.

If the MCP server is unavailable, the same facts are public: the service index,
the authentication guides, and each service's
`https://developer.mastercard.com/{serviceId}/documentation/llms-full.txt`,
which carries `auth_type` in its frontmatter. These are a fallback, not a
substitute.

## Start with the index: resolve the service, then read its auth type

Service names as marketed differ from the `serviceId` used to address them. The
index maps one to the other and carries the auth type.

- **Server connected:** call `get-services-list`. Its response contains
  *Products* and *Services*; only Services carry a `serviceId`, which is what
  every other tool takes.
- **Server unavailable:** the index is published at
  `https://developer.mastercard.com/llms.txt`.

Both give the same entry per service:

```
### <Service Name>
serviceId: <service-id>
authType: <auth type>
sourceUrl: https://developer.mastercard.com/<service-id>/documentation/index.md
```

**If more than one service matches the name, list the candidates and ask which
one including the description of the service.** "The Locations API" matches three distinct services: `locations` (ATM
Locations), `locations-intelligence` (Locations) and `locations-merchants`
(Location Services).

**Never construct a `serviceId` from the service name.** Slugs add suffixes,
drop vendor prefixes, abbreviate, differ by singular against plural, or use a
different word altogether.

**If the service is not in the index, stop and ask.** It may be retired,
renamed, or not a Mastercard Developers service.

**The index is enough to determine the auth type.** Do not fetch the service's
`llms-full.txt` to confirm it.

### Reading the published index without the server

**Retrieve the index in full and search the raw text. Do not read it with a
tool that summarises.** The file is large enough that a summarising fetch
returns a plausible service that is not in the file, with the wrong `authType`,
and reports no error. Any method that returns the bytes will do. Ask the
developer for the `serviceId` only once every route has failed.

## Confirming the auth type

Mastercard does not use one auth scheme. Confirm the service's `authType`, then
read the guide for that scheme.

**Never infer the auth type from the service name, and never default to
`OAuth1.0a`.** Services in the same family can carry different auth types, and a
service's auth type can change between releases.

| `authType` | Read the guide with | Fallback URL |
| --- | --- | --- |
| `OAuth1.0a` | `get-oauth10a-integration-guide` | https://developer.mastercard.com/platform/documentation/authentication/using-oauth-1a-to-access-mastercard-apis/index.md |
| `OAuth2`, or `OAuth1.0a and OAuth2 (FAPI 2.0)` | `get-oauth20-integration-guide`. Where both are listed, ask which the project is provisioned for. | https://developer.mastercard.com/platform/documentation/authentication/using-oauth-2-to-access-mastercard-apis/index.md |
| Anything starting `OpenBanking` | `get-openfinance-integration-guide` | The service's own documentation for the token exchange |
| `MTLS` | **No tool. The URL is the only route.** | https://developer.mastercard.com/platform/documentation/authentication/using-mtls-to-access-mastercard-apis/index.md |

Match the value loosely: `authType` appears in more than one form, including
`OpenBanking` with a trailing parenthetical.

**Pass the programming `language` you are writing.** Both guide tools take it and return
language-specific package names and signer APIs. Each enumerates the languages
it supports, with an explicit fallback value for anything outside that list.

**Read the guide rather than recalling it.** Package names, signer APIs, key
handling and signing steps differ per language and change.

## Building integration code

Asked to write code that calls a Mastercard API, work in this order. Each step
supplies an input the next one needs.

1. **Resolve the service.** `get-services-list` → `serviceId` and `authType`.
   Ask the developer if more than one service matches.
2. **Get the documentation map.** `get-documentation(serviceId)` → the page list
   and the `api_specification(s)` paths. Both operation tools take an
   `apiSpecificationPath`, not a `serviceId`, and this is the only source of it.
   Never assemble that path by hand. **If more than one path is returned, list
   them and ask which one applies.** Many services publish several, split by
   capability, version or region. Some publish more than twenty, where the
   regional variants differ from one another only by a `uk` or `eu` marker in
   the filename.
3. **Find the operation.** `get-api-operation-list(apiSpecificationPath)` →
   methods, paths, operation IDs and summaries. Skip only if the developer named
   the exact operation.
4. **Get the operation's contract.** `get-api-operation-details(apiSpecificationPath,
   method, path)` → parameters, request body and response schemas. Call it
   before writing a request body. Never invent a field name, and never assume
   one endpoint's shape from another's.
5. **Get the base URL.** Operation details return a path, not a host. Check the
   service's *API Basics* or *Environments* page first, using the path from step
   2 and `get-documentation-page`. If it carries no base URL, read the `servers`
   block of the API specification from step 2. The request URL is that base plus
   the operation path. Hosts vary, e.g. ATM Locations is
   `https://sandbox.api.mastercard.com/locations/atms`, Identity Insights for
   Transactions is `https://sandbox.idv.mastercard.com/identity`.
6. **Read the auth guide** for the scheme and language, per the table above.
7. **Write the code**, then check it against *Things generated code gets wrong*.

## Things generated code gets wrong

Any auth type:

- **Match the base URL to the credentials.** Many services sit under
  `https://sandbox.api.mastercard.com` or `https://api.mastercard.com`, but not
  all do. Never assemble a base URL from the host alone, and never point sandbox
  credentials at production.

OAuth 1.0a only. None of this applies to `MTLS` or `OpenBanking`, which do not
sign requests:

- **Do not carry a signer's API across languages.** The signers share a name,
  not a signature, and the argument lists differ.
- **Sign every request individually.** The authorization header is bound to one
  URI, method and body. Caching or reusing it fails.
- **Serialize the body once.** Sign those exact bytes and send those exact
  bytes. In Python that means passing `data=body_string`, not `json=payload`,
  when you signed the string.

## When authentication fails

Read the `ReasonCode` in the response body before acting on the status alone.
One status can carry more than one meaning.

| Response | Applies to | What it means |
| --- | --- | --- |
| `401` with an auth reason code | Any | The credential was rejected. Work through the checklist for your auth type below. |
| `401` `DECLINED` "Unauthorized - Access Not Granted" | Any | **The credential is valid.** The project is not entitled to that endpoint. Request access rather than changing the auth code. |
| `403` `AUTHENTICATION_FAILED` | OAuth 1.0a | Signature verification failed, commonly a consumer key that does not match the keystore. |
| `400` `INVALID_AUTH_HEADER` | OAuth 1.0a | Malformed or missing `Authorization` header. An auth failure, not request validation. |
| `422` `INVALID_CLIENT_CERT` | mTLS | The client certificate was missing or rejected. |
| `400` or `500` from a named backend service | Any | **Authentication succeeded.** The request cleared the gateway and failed downstream. Read `Source`: anything other than `Gateway` means the credential was accepted. Common causes are an ICA not provisioned for the product, or an encryption key not registered for the project (`DECRYPT_PRIVATE_KEY_NOT_FOUND`, `REQUEST_DECRYPT_FAILED`). Provisioning is requested separately. |

An entitlement gap and a credential error can arrive on the same status, so
check the `ReasonCode` before changing code that was previously working.

A `400` from `Source: Gateway` that is *not* `INVALID_AUTH_HEADER` is request
validation. Re-read the operation's schema with `get-api-operation-details`
rather than changing the signing code.

### OAuth 1.0a: a request that still returns 401

In order:

- The consumer key does not match the one on the Mastercard Developers project.
- The host does not match the credentials. Sandbox keys against production return 401.
- The OAuth timestamp is outside the gateway's tolerance window. Check the clock.
- The body was modified after the signature was computed.

### mTLS: the failure may arrive without a status

The client certificate is presented on the TLS connection, so a missing or
rejected certificate can be refused during the handshake and surface as a
connection or SSL error rather than a response. When there is no status to read,
confirm the certificate and key are being loaded and presented on the connection
before looking anywhere else.

### OpenBanking: check both calls

The token exchange and the request that follows are authenticated separately. A
successful token response does not mean the request that follows was accepted.
Check the status of each.
