/**
 * Optional post quantum attestation of agent actions.
 *
 * When an agent acts on a Mastercard API through this toolkit, the record of
 * what it did is often reviewed later. This signs a canonical action manifest
 * with FIPS 204 ML-DSA so a reviewer can confirm the recorded action is
 * authentic and was not altered, using a signature scheme that stays safe once
 * large quantum computers can break RSA and elliptic curve signatures.
 *
 * The attestation is self contained: it carries the public key and the
 * signature, so a verifier needs only the attestation and the action.
 */
import { sha256 } from '@noble/hashes/sha2.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';

export const SCHEME = 'ML-DSA-65';
export const ISSUER = 'Quantova';

export interface Keypair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface Attestation {
  scheme: string;
  issuer: string;
  payloadSha256: string;
  publicKey: string;
  signature: string;
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

function fromBase64(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, 'base64'));
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'null';
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  const entries = Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
  return `{${entries.join(',')}}`;
}

/** Return the canonical bytes an attestation is computed over. */
export function canonicalize(action: unknown): Uint8Array {
  return new TextEncoder().encode(stableStringify(action));
}

/** Return a fresh keypair for the signer. */
export function generateKeypair(): Keypair {
  return ml_dsa65.keygen();
}

/** Return a self contained attestation over the payload bytes. */
export function buildAttestation(
  payload: Uint8Array,
  publicKey: Uint8Array,
  secretKey: Uint8Array
): Attestation {
  const signature = ml_dsa65.sign(payload, secretKey);
  return {
    scheme: SCHEME,
    issuer: ISSUER,
    payloadSha256: toHex(sha256(payload)),
    publicKey: toBase64(publicKey),
    signature: toBase64(signature),
  };
}

/**
 * Return true when the attestation matches the payload. The payload digest is
 * always checked. When expectedPublicKey is given the signer is pinned too, so
 * a valid signature made under a different key is rejected.
 */
export function verifyAttestation(
  payload: Uint8Array,
  attestation: Attestation,
  expectedPublicKey?: Uint8Array
): boolean {
  if (attestation.payloadSha256 !== toHex(sha256(payload))) {
    return false;
  }
  let publicKey: Uint8Array;
  let signature: Uint8Array;
  try {
    publicKey = fromBase64(attestation.publicKey);
    signature = fromBase64(attestation.signature);
  } catch {
    return false;
  }
  if (
    expectedPublicKey !== undefined &&
    Buffer.compare(publicKey, expectedPublicKey) !== 0
  ) {
    return false;
  }
  try {
    return ml_dsa65.verify(signature, payload, publicKey);
  } catch {
    return false;
  }
}
