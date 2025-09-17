/**
 * @jest-environment node
 */

const request = require('supertest');

jest.mock('../../backend/src/lib/ton', () => ({
  verifyTonPayment: jest.fn(),
}));

let verifyTonPayment;

describe('subscription API', () => {
  let app;
  let agent;

  beforeEach(() => {
    jest.resetModules();
    const tonModule = require('../../backend/src/lib/ton');
    verifyTonPayment = jest.fn();
    tonModule.verifyTonPayment = verifyTonPayment;
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.SUBSCRIPTION_BONUS_XP = '42';
    process.env.TON_RECEIVE_ADDRESS = 'EQTestReceiveWallet123';
    process.env.TON_MIN_AMOUNT_NANO = '500000000';
    verifyTonPayment.mockResolvedValue({
      verified: true,
      amount: '500000000',
      to: process.env.TON_RECEIVE_ADDRESS,
      from: 'EQTestWallet123',
      comment: '7GC-SUB:123456',
    });
    app = require('../../backend/server');
    agent = request.agent(app);
  });

  afterEach(() => {
    delete process.env.SUBSCRIPTION_BONUS_XP;
    delete process.env.TON_RECEIVE_ADDRESS;
    delete process.env.TON_MIN_AMOUNT_NANO;
  });

  test('returns default status without a wallet session', async () => {
    const res = await agent.get('/api/v1/subscription/status').expect(200);
    expect(res.body).toMatchObject({
      tier: 'Free',
      wallet: null,
      canClaim: false,
    });
    expect(res.body.levelName).toBeTruthy();
  });

  test('claim endpoint awards XP once and is idempotent', async () => {
    const wallet = 'EQTestWallet123';
    await agent.post('/api/session/bind-wallet').send({ wallet }).expect(200);

    const beforeClaim = await agent.get('/api/v1/subscription/status').expect(200);
    expect(beforeClaim.body.wallet).toBe(wallet);
    expect(beforeClaim.body.canClaim).toBe(false);

    const paymentStatusBefore = await agent.get('/api/v1/payments/status').expect(200);
    expect(paymentStatusBefore.body).toMatchObject({ paid: false });

    const verifyResponse = await agent
      .post('/api/v1/payments/verify')
      .send({
        txHash: 'abc123',
        amount: '500000000',
        to: process.env.TON_RECEIVE_ADDRESS,
        comment: '7GC-SUB:123456',
      })
      .expect(200);
    expect(verifyResponse.body).toEqual({
      verified: true,
      paid: true,
      lastPaymentAt: expect.any(Number),
    });

    expect(verifyTonPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        txHash: 'abc123',
        to: process.env.TON_RECEIVE_ADDRESS,
      })
    );

    const afterPayment = await agent.get('/api/v1/subscription/status').expect(200);
    expect(afterPayment.body.canClaim).toBe(true);
    expect(afterPayment.body.tier).toBe('Premium');

    const subscribeRes = await agent
      .post('/api/v1/subscription/subscribe')
      .send({ tier: 'premium' })
      .expect(200);
    expect(subscribeRes.body).toMatchObject({ ok: true });
    expect(subscribeRes.body.status).toMatchObject({ tier: 'Premium', canClaim: true });

    const paymentStatusAfter = await agent.get('/api/v1/payments/status').expect(200);
    expect(paymentStatusAfter.body).toMatchObject({ paid: true });

    const claim = await agent.post('/api/v1/subscription/claim').send({}).expect(200);
    expect(claim.body.xpDelta).toBe(42);
    expect(claim.body.status.canClaim).toBe(false);
    expect(claim.body.status.wallet).toBe(wallet);

    const afterClaim = await agent.get('/api/v1/subscription/status').expect(200);
    expect(afterClaim.body.canClaim).toBe(false);
    expect(afterClaim.body.claimedAt).not.toBeNull();
    expect(afterClaim.body.lastClaimDelta).toBe(42);
    const xpAfterClaim = afterClaim.body.totalXP || afterClaim.body.xp;
    expect(xpAfterClaim).toBeGreaterThanOrEqual(42);

    const secondClaim = await agent.post('/api/v1/subscription/claim').send({}).expect(200);
    expect(secondClaim.body.xpDelta).toBe(0);
    expect(secondClaim.body.status.canClaim).toBe(false);
    expect(secondClaim.body.status.lastClaimDelta).toBe(0);

    const afterSecond = await agent.get('/api/v1/subscription/status').expect(200);
    expect(afterSecond.body.canClaim).toBe(false);
    expect(afterSecond.body.lastClaimDelta).toBe(0);
    const xpAfterSecond = afterSecond.body.totalXP || afterSecond.body.xp;
    expect(xpAfterSecond).toBe(xpAfterClaim);
  });

  test('rejects verification when sender wallet differs from session wallet', async () => {
    const wallet = 'EQTestWallet123';
    await agent.post('/api/session/bind-wallet').send({ wallet }).expect(200);

    verifyTonPayment.mockResolvedValueOnce({
      verified: true,
      amount: '500000000',
      to: process.env.TON_RECEIVE_ADDRESS,
      from: 'EQAnotherWallet456',
      comment: '7GC-SUB:987654',
    });

    const mismatch = await agent
      .post('/api/v1/payments/verify')
      .send({ txHash: 'mismatch-hash', comment: '7GC-SUB:987654' })
      .expect(403);
    expect(mismatch.body).toMatchObject({ verified: false, error: 'wallet-mismatch' });

    const status = await agent.get('/api/v1/payments/status').expect(200);
    expect(status.body).toMatchObject({ paid: false });
  });
});
