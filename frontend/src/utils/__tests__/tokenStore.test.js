import { describe, it, expect, beforeEach, vi } from 'vitest';

let store;

beforeEach(async () => {
  vi.resetModules();
  store = await import('../tokenStore');
});

describe('tokenStore', () => {
  it('starts with no token', () => {
    expect(store.getToken()).toBeNull();
  });

  it('stores and returns a token', () => {
    store.setToken('abc');
    expect(store.getToken()).toBe('abc');
  });

  it('clears the token', () => {
    store.setToken('abc');
    store.clearToken();
    expect(store.getToken()).toBeNull();
  });

  it('returns the cached token without invoking the getter', async () => {
    const getter = vi.fn(async () => 'from-getter');
    store.setTokenGetter(getter);
    store.setToken('cached');

    await expect(store.refreshToken()).resolves.toBe('cached');
    expect(getter).not.toHaveBeenCalled();
  });

  it('invokes the getter when uncached and caches the result', async () => {
    const getter = vi.fn(async () => 'from-getter');
    store.setTokenGetter(getter);

    await expect(store.refreshToken()).resolves.toBe('from-getter');
    expect(getter).toHaveBeenCalledTimes(1);
    expect(store.getToken()).toBe('from-getter');
  });

  it('returns null when the getter yields nothing', async () => {
    store.setTokenGetter(async () => null);
    await expect(store.refreshToken()).resolves.toBeNull();
    expect(store.getToken()).toBeNull();
  });

  it('returns null when no getter is registered', async () => {
    await expect(store.refreshToken()).resolves.toBeNull();
  });

  it('replaces a previously registered getter', async () => {
    const first = vi.fn(async () => 'first');
    const second = vi.fn(async () => 'second');
    store.setTokenGetter(first);
    store.setTokenGetter(second);

    await expect(store.refreshToken()).resolves.toBe('second');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('bypasses the cache and forwards options when forced', async () => {
    const getter = vi.fn(async () => 'fresh');
    store.setTokenGetter(getter);
    store.setToken('stale');

    await expect(store.refreshToken({ force: true })).resolves.toBe('fresh');
    expect(getter).toHaveBeenCalledWith({ force: true });
    expect(store.getToken()).toBe('fresh');
  });

  it('falls back to the cached token when a forced refresh yields nothing', async () => {
    store.setTokenGetter(async () => null);
    store.setToken('stale');

    await expect(store.refreshToken({ force: true })).resolves.toBe('stale');
  });

  it('falls back to the cached token when forced without a getter', async () => {
    store.setToken('stale');
    await expect(store.refreshToken({ force: true })).resolves.toBe('stale');
  });
});
