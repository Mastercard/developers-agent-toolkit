---
name: mastercard-payload-encryption
description: >-
  Request and response payload encryption for Mastercard APIs: finding a service's own encryption profile, JWE vs. Mastercard (field level) encryption, the client-encryption libraries, the Client Encryption Key and Mastercard Encryption Key, encrypting before OAuth 1.0a signing, and decryption failures. Use when building, debugging, or reviewing code that encrypts requests to, or decrypts responses from, a Mastercard API. Trigger phrases: "Mastercard encryption", "Mastercard payload encryption", "Mastercard JWE", "Mastercard field level encryption", "Mastercard client-encryption", "Client Encryption Key", "Mastercard Encryption Key", "x-mastercard-api-encrypted", "X-Encrypted", "encryptedValue", "oaepHashingAlgorithm", "DECRYPT_PRIVATE_KEY_NOT_FOUND", "REQUEST_DECRYPT_FAILED", "CRYPTOGRAPHY_ERROR", "CRYPTO_ERROR".
---

# Mastercard Payload Encryption

## Every service has its own encryption profile

Mastercard defines two encryption schemes and publishes libraries that implement both. **How a given service uses them is set by that service, and nothing about it carries over from another service.** The platform guide says so directly: *"The method of encryption used by each respective service will be outlined in the service's documentation."*

**Never fill in any part of a profile from memory, from another service, or from a library README example.** README values such as `$.path.to.foo`, `encryptedData`, `SHA-256` and `hex` are placeholders, not defaults. A profile that is wrong in one field fails at runtime, often with an error that does not name the field.

These are the parts of a profile, with values observed in real services to show how far they vary:

| Part of the profile | Varies by | Observed examples |
| --- | --- | --- |
| Whether encryption applies, and to which operations | Service, operation | Consumer Clarity requires the `/registrations` request to be encrypted in full with JWE and returns `transaction-data` responses encrypted. Its *Authentication and Encryption* page mentions only the response. ATM Locations states that payload encryption is not required. |
| Direction | Service, operation | Request only, response only, or both. |
| Scheme | Service | JWE, or Mastercard encryption (the libraries call it *Field Level Encryption*). Account Validation and Mastercard Processing use JWE. |
| Encryption and decryption paths | Service, operation | Account Validation wraps the whole body: `$` → `$.encrypted_payload`. Mastercard Processing encrypts in place: `$` → `$`. |
| Encrypted value field name | Service | `data` (Account Validation), `encryptedValue` (Mastercard Processing), `encryptedData` (MDES Authentication Facilitator). |
| Mastercard encryption parameters | Service | OAEP digest (`SHA-256` or `SHA-512`), value encoding (hex or base64), the `iv`, encrypted key and fingerprint field names, and whether these travel in the body or in HTTP headers. |
| Opt-in at onboarding | Partner | Account Validation's `X-Encrypted` header must be `true`, may be either, or must be omitted, depending on whether encryption was set to *enabled*, *flexible* or *disabled* for the partner at onboarding. |
| Environment support | Service | Account Validation's sandbox does not support payload encryption; encrypted calls go to MTF with sandbox keys. |
| Who calls whom | Service | Most services are called by you. Some call your server: MDES Authentication Facilitator sends encrypted requests to the issuer over mutual TLS. This reverses which key does what (see [Encryption keys](#encryption-keys)). |
| Deviations from the platform guide | Service | MDES Authentication Facilitator names its digest field `oaepHashingAlgorithm` (the guide says `oaepPaddingDigestAlgorithm`). It offers AES-GCM as well as CBC, and supports legacy RSA PKCS#1 v1.5 until 31 March 2027 (re-check the service's documentation). |
| Schemes outside the libraries | Service | Mastercard Processing's PIN block encryption. Options: a Zone PIN Key exchanged at onboarding; RSA keys fetched from `/public-keys` and rotated frequently; or, for `getPin`, your own RSA key sent in the `Customer-Public-Rsa-Key` header. |

These examples are evidence that profiles vary, recorded at the time of writing. They are not values to reuse and may have changed. Re-read the service's own pages every time.

## Establish the profile before writing code

Work in this order. Each step supplies an input the next one needs.

1. **Resolve the service.** Use `get-services-list` to get the `serviceId` and `authType`, as described in the `mastercard-best-practices` skill. Never construct a `serviceId` from the service name. Names are ambiguous: "Account Validation" and "Mastercard Processing" each match several services with different profiles. If more than one matches, ask which one.
2. **Find the service's encryption pages.** Call `get-documentation(serviceId)` and scan the page list. The titles are not consistent. Seen so far: *Encryption*, *Message Encryption and Decryption*, *Authentication and Encryption*, *Security Overview and Encryption*, *Add Payload Encryption*, *Perform Encryption*. Encryption can also appear only inside *API Basics*, a tutorial, the Insomnia or Postman setup, or *Code and Formats*. Read every candidate with `get-documentation-page`.
3. **Check that no requirement has been missed.** A service's encryption page can be incomplete. Requirements for individual operations are often stated only in the use-case, guide or testing pages for that operation. Retrieve `https://developer.mastercard.com/{serviceId}/documentation/llms-full.txt` in full and search the raw text for `encrypt`. Read every operation it names.
   - **Check the raw spec for the encryption marker.** Some raw OpenAPI specs mark encrypted operations with `x-mastercard-api-encrypted: true`; Consumer Clarity's do, for example. The MCP operation tools do not show this marker. Fetch each raw spec from the full URLs listed under `api_specification(s)` in the `get-documentation(serviceId)` output (for example `https://static.developer.mastercard.com/content/consumer-clarity/swagger/consumer-clarity-api-spec.yml`); use them as given rather than building a URL. Search the raw text for `x-mastercard-api-encrypted`. If no specs are listed, rely on the documentation alone.
   - **Treat the marker as one-way evidence.** Use the marker only to confirm that an operation is encrypted. Its absence proves nothing: Account Validation's spec has no marker, yet that service encrypts. If the marker or a schema description says an operation is encrypted but the documentation says it is not, or the other way round, report the conflict to the developer and ask. Do not resolve it either way yourself.
4. **Read the operation's contract.** `get-api-operation-details(apiSpecificationPath, method, path)` shows encryption-related header parameters such as `X-Encrypted` and their descriptions. Use the schema for the plaintext fields. Take encryption paths and field names from the documentation. If the documentation's only example is for a different operation, the schema's encrypted envelope for this operation (an object holding fields such as `encryptedData`, `encryptedKey` and `iv`) is the best remaining evidence. Use it, label each value as derived from the schema rather than documented, and ask the developer to confirm it.
5. **Write the profile down with a source for each value.** Before writing code, list scheme, direction, operations, paths, field names and (for Mastercard encryption) OAEP digest, encoding and header-versus-body parameters. Give the documentation page each value came from.
6. **Ask for anything the documentation does not state.** Some settings, such as the `X-Encrypted` mode or an OAEP digest chosen at onboarding, exist only in the developer's onboarding material. Ask for them. If code must be written first, leave a clearly marked placeholder (`TODO: confirm from <service> onboarding`). Never put a plausible value in its place.
7. **If the service has no encryption pages, say so.** Do not add encryption on the assumption that a payments API needs it, and do not leave it out on the assumption that it does not. Confirm with the developer.

### Without the MCP server

The same facts are public:

- The platform guide: https://developer.mastercard.com/platform/documentation/security-and-authentication/securing-sensitive-data-using-payload-encryption/index.md. It describes both schemes and the keys, but not any service's profile.
- The service's `https://developer.mastercard.com/{serviceId}/documentation/llms-full.txt`. Retrieve it in full and search the raw text for `encrypt`. Do not use a tool that summarises, because summaries drop or invent field names. Its frontmatter lists the raw spec URLs under `api_specification(s)`; fetch them to check for `x-mastercard-api-encrypted`.
- The README of the client-encryption library for the target language (see below).

## The two schemes

The platform guide describes both schemes as wrapping a one-time AES session key with the recipient's 2048-bit RSA public key using OAEP. Both support encrypting the entire payload (`$`) or individual fields. Individual services can differ from the guide (see the profile table above), and the libraries may not support every variant a service offers. If a service offers an option the target library lacks, such as AES-GCM for Mastercard encryption, say so. Do not pick that option.

| | JWE | Mastercard encryption |
| --- | --- | --- |
| Library name | JWE | Field Level Encryption (FLE) |
| Wire format | One compact-serialised JWE string in a single field. | Separate fields for the IV, encrypted key, encrypted value, public key fingerprint and OAEP digest, or some of these as HTTP headers. |
| AES modes (libraries) | Encrypt with GCM (`A256GCM`); decrypt GCM or CBC (`A128CBC-HS256`) | CBC |
| Extra settings to confirm | Encrypted value field name, paths | Paths, every field or header name, OAEP digest, value encoding |

Never switch a service from one scheme to the other. The service decides which one it accepts.

## Client libraries

Mastercard strongly recommends its libraries over hand-written encryption. Every library implements both schemes.

| Language | Package | JWE / Mastercard-encryption config | README |
| --- | --- | --- | --- |
| Java | Maven `com.mastercard.developer:client-encryption` | `JweConfigBuilder` / `FieldLevelEncryptionConfigBuilder`, with JSONPath strings | https://github.com/Mastercard/client-encryption-java |
| C# | NuGet `Mastercard.Developer.ClientEncryption.Core` (plus `.RestSharpV2` or `.RestSharp` for interceptors) | `JweConfigBuilder` / `FieldLevelEncryptionConfigBuilder`, with JSONPath strings | https://github.com/Mastercard/client-encryption-csharp |
| Python | PyPI `mastercard-client-encryption` | `JweEncryptionConfig` / `FieldLevelEncryptionConfig` from a dict or JSON file; `paths` keyed by resource with `toEncrypt` / `toDecrypt` maps | https://github.com/Mastercard/client-encryption-python |
| Node.js | npm `mastercard-client-encryption` | A config object; `paths` is an array of `{ path, toEncrypt, toDecrypt }` entries with `element` / `obj` pairs; `mode: "JWE"` selects JWE | https://github.com/Mastercard/client-encryption-nodejs |
| Go | `github.com/mastercard/client-encryption-go` | `jwe.NewJWEConfigBuilder()` / `field_level_encryption.NewFieldLevelEncryptionConfigBuilder()` | https://github.com/Mastercard/client-encryption-go |

Mastercard's PHP and Ruby libraries (`client-encryption-php`, `client-encryption-ruby`) are archived on GitHub, although some service pages still show PHP or Ruby configuration. Tell the developer before relying on them.

**Read the README for the target language before writing configuration.** Supported runtime versions, package variants and interceptors for generated OpenAPI clients are listed there and change between releases.

**Do not carry configuration across languages.** The libraries share concepts, not syntax:

- Paths are JSONPath strings in Java and C#. Python and Node.js use nested path maps keyed by resource. In Go, Mastercard encryption treats `$` as a special case and resolves every other path with `gabs` dot notation (`a.b`), despite the `$.`-prefixed examples in the README. Check the library source before using a nested path.
- The decryption key is `decryptionKey` in Python and `privateKey` in Node.js.
- The value-encoding builder method is `withFieldValueEncoding` in Java and `WithValueEncoding` in C#.
- Decryption-path conventions differ between schemes and between libraries. In the Java JWE example, the decryption path ends at the encrypted value field (`$.path.to.encryptedFoo.encryptedValue`). In the Mastercard-encryption example, it ends at the containing object. Follow the service's own example where one exists, then that library's README.

**Check that encryption actually happened.** A path that matches nothing can be skipped, or an empty value encrypted, without any error, and the plaintext is then sent. This happens with copied paths, with `$.` paths for Mastercard encryption in Go, and with paths that do not match the body's real nesting. After encrypting, check that every sensitive field is gone from the outgoing body and that the encrypted fields are present. Refuse to send the request if not.

If the target language has no library, tell the developer before writing any cryptography. The libraries and the platform guide can serve as a reference implementation, but a hand-written implementation needs the developer's agreement.

## Encryption keys

Payload encryption uses two RSA key pairs. Both are created per service in the project on the [Developer Dashboard](https://developer.mastercard.com/dashboard).

| Dashboard name | What you hold | Format | Used to | Library input |
| --- | --- | --- | --- | --- |
| **Client Encryption Key** | Mastercard's public certificate | PEM or DER certificate | Encrypt requests | Encryption certificate |
| **Mastercard Encryption Key** | Your private key | PKCS#12 keystore (with alias and password), or an unencrypted PKCS#1 or PKCS#8 key | Decrypt responses | Decryption key |

The table assumes you call Mastercard. **When Mastercard calls your server** (for example, MDES Authentication Facilitator calling an issuer), the roles reverse. You decrypt incoming requests with the Mastercard Encryption Key, and encrypt any sensitive response fields with the Client Encryption Key. Client-side HTTP interceptors do not apply; call the library's payload functions in your request handler. Map each incoming `publicKeyFingerprint` to its private key so that key rotation works.

**The names are the most common source of mix-ups.** The *Mastercard Encryption Key* is the key Mastercard uses to encrypt responses to you, so the half you hold is your private *decryption* key. Do not pass it as the encryption certificate.

- **Take the public key fingerprint from the Dashboard or the service documentation.** The fingerprint tells Mastercard which key to decrypt with. The libraries can compute one from the certificate, but how they compute it varies by library and option (certificate or public key), and a service may expect a different value. If the computed value may not match, set the fingerprint explicitly and ask the developer to confirm it.
- **Encryption keys are not signing keys.** The OAuth 1.0a signing keystore is a different key, even though both can be `.p12` files. Never load one in place of the other.
- **Keys are tied to an environment.** Production keys work only in production. Which keys a service accepts in MTF is set by the service: Account Validation, for example, takes sandbox keys in MTF. Check the service's documentation, and match the keys to the host just as with signing credentials.
- **Mastercard never holds your private key.** A lost decryption key cannot be recovered. Create a new key on the Dashboard and register it.
- **Keep private keys and keystore passwords out of source control.** Load them from a secrets manager or environment-specific configuration, in a password-protected or hardware key store.
- **The libraries accept the certificate directly.** Only if something needs the bare public key, extract it with `openssl x509 -pubkey -noout -in cert.pem > key.pem`.

## Combining encryption with authentication

**For OAuth 1.0a, encrypt first, then sign the encrypted body.** The OAuth body hash must cover the bytes that are sent, which are the encrypted bytes. Each library's own integration shows the order:

- **Java (OkHttp):** add the encryption interceptor before the OAuth 1.0a interceptor: `.addInterceptor(OkHttpEncryptionInterceptor.from(config))`, then `.addInterceptor(new OkHttpOAuth1Interceptor(...))`.
- **C# (RestSharp):** call `_encryptionInterceptor.InterceptRequest(request)` before `_signer.Sign(...)`.
- **Python (generated client):** call `add_signing_layer` first, then `add_encryption_layer`. The outer layer runs first, so encryption happens before signing.
- **Go:** pass the signer to the interceptor for the service's scheme. `GetHttpClient` takes the config by value, so dereference the pointer that `Build()` returns. The `mastercard_interceptor` package is in the library source but not in the README. In these snippets, `encryptionCertificate` is the Client Encryption Key certificate and `signer` is an `*oauth.Signer` from `github.com/mastercard/oauth1-signer-go`. For services that don't use OAuth 1.0a, pass `nil` instead of `signer.Sign`.

  JWE:

  ```go
  jweConfig := jwe.NewJWEConfigBuilder().
  	WithCertificate(encryptionCertificate).
  	// decryption key (if responses are encrypted), paths and field names from the service's profile
  	Build()
  client, err := interceptor.GetHttpClient(*jweConfig, signer.Sign)
  if err != nil {
  	return err
  }
  // use client for requests
  ```

  Mastercard encryption, where `Build()` also returns an error:

  ```go
  fleConfig, err := field_level_encryption.NewFieldLevelEncryptionConfigBuilder().
  	WithEncryptionCertificate(encryptionCertificate).
  	// decryption key (if responses are encrypted), paths, field names, OAEP digest and encoding from the service's profile
  	Build()
  if err != nil {
  	return err
  }
  client, err := mastercard_interceptor.GetHttpClient(*fleConfig, signer.Sign)
  if err != nil {
  	return err
  }
  // use client for requests
  ```

Never sign the plaintext and then encrypt it. Never re-serialise the body after encrypting it.

For `MTLS` and `OpenBanking` services, encryption is independent of the auth layer. Follow the service's documentation for any ordering it specifies.

## When encryption or decryption fails

Read the response's `ReasonCode` and `Source`, and the service's own error codes page, before changing code. A backend `Source` (anything other than `Gateway`) means authentication succeeded and the failure is downstream.

| Symptom | Check first |
| --- | --- |
| `DECRYPT_PRIVATE_KEY_NOT_FOUND`, `REQUEST_DECRYPT_FAILED`, `CRYPTOGRAPHY_ERROR`, `CRYPTO_ERROR` or a similar decryption error from a backend service | Is a Client Encryption Key registered for this service in this project and environment? Was the request encrypted with that certificate, and not one from another project or environment? Do the scheme, paths and field names match the service's profile? |
| An encryption error that works unencrypted in sandbox | Does the service support encryption in sandbox at all? Some services require MTF for encrypted calls. |
| The library fails to decrypt locally | Is the *Mastercard Encryption Key* (not the signing key or the client certificate) loaded, with the correct alias and password, for the right environment? |
| Response fields stay encrypted, or are missing after decryption | The decryption path or encrypted value field name does not match what the service returns. Re-read the profile. |
| Errors that appear only when an encryption header such as `X-Encrypted` is sent or left out | Check the header against the encryption mode set for the partner at onboarding, as described on the operation. |
| `401` after adding encryption | The body was signed before it was encrypted, or changed after signing. Fix the order of encryption and signing. |

For authentication failures not caused by encryption, use the error table in the `mastercard-best-practices` skill.
