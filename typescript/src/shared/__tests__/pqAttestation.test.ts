import {
  buildAttestation,
  canonicalize,
  generateKeypair,
  verifyAttestation,
} from '../pqAttestation';

const ACTION = {
  tool: 'authorize_payment',
  amount: '100.00',
  currency: 'USD',
};

describe('pqAttestation', () => {
  it('builds and verifies an attestation', () => {
    const payload = canonicalize(ACTION);
    const { publicKey, secretKey } = generateKeypair();
    const attestation = buildAttestation(payload, publicKey, secretKey);
    expect(attestation.scheme).toBe('ML-DSA-65');
    expect(attestation.issuer).toBe('Quantova');
    expect(verifyAttestation(payload, attestation)).toBe(true);
    expect(verifyAttestation(payload, attestation, publicKey)).toBe(true);
  });

  it('rejects a tampered action', () => {
    const payload = canonicalize(ACTION);
    const { publicKey, secretKey } = generateKeypair();
    const attestation = buildAttestation(payload, publicKey, secretKey);
    const altered = canonicalize({ ...ACTION, amount: '999.00' });
    expect(verifyAttestation(altered, attestation)).toBe(false);
  });

  it('rejects a wrong signer when pinned', () => {
    const payload = canonicalize(ACTION);
    const { publicKey, secretKey } = generateKeypair();
    const other = generateKeypair();
    const attestation = buildAttestation(payload, publicKey, secretKey);
    expect(verifyAttestation(payload, attestation, other.publicKey)).toBe(
      false
    );
  });

  it('rejects a forged signature', () => {
    const payload = canonicalize(ACTION);
    const { publicKey, secretKey } = generateKeypair();
    const attestation = buildAttestation(payload, publicKey, secretKey);
    attestation.signature = Buffer.from(new Uint8Array(64)).toString('base64');
    expect(verifyAttestation(payload, attestation)).toBe(false);
  });

  it('rejects a malformed field', () => {
    const payload = canonicalize(ACTION);
    const { publicKey, secretKey } = generateKeypair();
    const attestation = buildAttestation(payload, publicKey, secretKey);
    attestation.publicKey = '!!!not base64!!!';
    expect(verifyAttestation(payload, attestation)).toBe(false);
  });
});
