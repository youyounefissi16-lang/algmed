import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let api;
let store;
let fetchMock;

const res = (status, body = '') => ({
  status,
  clone: () => ({ text: async () => body }),
});

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('VITE_API_BASE_URL', 'http://api.test');
  vi.stubEnv('VITE_LOG_LEVEL', 'error');
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  store = await import('../../utils/tokenStore');
  api = await import('../api');
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('API_BASE_URL', () => {
  it('reads the base url from env', () => {
    expect(api.API_BASE_URL).toBe('http://api.test');
  });

  it('strips trailing slashes so urls never contain a double slash', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.algmed.tech/');
    const mod = await import('../api');
    expect(mod.API_BASE_URL).toBe('https://api.algmed.tech');
  });
});

describe('authHeaders', () => {
  it('returns an empty object when no token is present', () => {
    expect(api.authHeaders()).toEqual({});
  });

  it('returns a bearer header when a token is present', () => {
    store.setToken('tok');
    expect(api.authHeaders()).toEqual({ Authorization: 'Bearer tok' });
  });
});

describe('fetchWithAuth', () => {
  it('rejects when no token can be obtained', async () => {
    await expect(api.fetchWithAuth('/x')).rejects.toThrow('No auth token');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('attaches auth, serializes object bodies, and returns the response', async () => {
    store.setToken('tok');
    fetchMock.mockResolvedValue(res(200));

    const out = await api.fetchWithAuth('/x', { method: 'POST', body: { a: 1 } });

    expect(out.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/x');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"a":1}');
  });

  it('leaves FormData bodies untouched', async () => {
    store.setToken('tok');
    fetchMock.mockResolvedValue(res(200));
    const fd = new FormData();
    fd.append('k', 'v');

    await api.fetchWithAuth('/upload', { method: 'POST', body: fd });

    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(fd);
    expect(init.headers['Content-Type']).toBeUndefined();
  });

  it('forwards a live abort signal', async () => {
    store.setToken('tok');
    fetchMock.mockResolvedValue(res(200));
    const controller = new AbortController();

    await api.fetchWithAuth('/x', { signal: controller.signal });

    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
  });

  it('drops an already-aborted signal', async () => {
    store.setToken('tok');
    fetchMock.mockResolvedValue(res(200));
    const controller = new AbortController();
    controller.abort();

    await api.fetchWithAuth('/x', { signal: controller.signal });

    expect(fetchMock.mock.calls[0][1].signal).toBeUndefined();
  });

  it('clears the token and redirects on 409 without retrying', async () => {
    store.setToken('tok');
    vi.stubGlobal('window', { location: { href: '' } });
    fetchMock.mockResolvedValue(res(409));

    const out = await api.fetchWithAuth('/x');

    expect(out.status).toBe(409);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(store.getToken()).toBeNull();
    expect(window.location.href).toBe('/login?conflict=1');
  });

  it('retries a 5xx three times, then returns the last response', async () => {
    store.setToken('tok');
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(res(500));

    const pending = api.fetchWithAuth('/x');
    await vi.advanceTimersByTimeAsync(5000);

    await expect(pending).resolves.toMatchObject({ status: 500 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('forces a fresh token after a 401 and retries three times before throwing', async () => {
    const getter = vi.fn(async () => 'fresh');
    store.setTokenGetter(getter);
    store.setToken('stale');
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(res(401, 'nope'));

    const pending = api.fetchWithAuth('/x').catch((e) => e);
    await vi.advanceTimersByTimeAsync(5000);

    const err = await pending;
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('Token rejected after 3 retries');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getter).toHaveBeenCalledTimes(2);
    expect(getter).toHaveBeenCalledWith({ force: true });
    const auths = fetchMock.mock.calls.map(([, init]) => init.headers.Authorization);
    expect(auths).toEqual(['Bearer stale', 'Bearer fresh', 'Bearer fresh']);
  });

  it('recovers when a forced refresh yields a usable token', async () => {
    const getter = vi.fn(async () => 'fresh');
    store.setTokenGetter(getter);
    store.setToken('stale');
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(res(401, 'expired'))
      .mockResolvedValueOnce(res(200));

    const pending = api.fetchWithAuth('/x');
    await vi.advanceTimersByTimeAsync(5000);

    await expect(pending).resolves.toMatchObject({ status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer fresh');
  });

  it('retries network errors three times, then rethrows', async () => {
    store.setToken('tok');
    vi.useFakeTimers();
    fetchMock.mockRejectedValue(new Error('boom'));

    const pending = api.fetchWithAuth('/x').catch((e) => e);
    await vi.advanceTimersByTimeAsync(5000);

    const err = await pending;
    expect(err.message).toBe('boom');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe('publicFetch', () => {
  it('prefixes relative paths and passes absolute urls through', async () => {
    fetchMock.mockResolvedValue(res(200));

    await api.publicFetch('/api/plans');
    await api.publicFetch('https://cdn.example/x');

    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/plans');
    expect(fetchMock.mock.calls[1][0]).toBe('https://cdn.example/x');
  });
});

describe('authFetch', () => {
  it('prefixes relative paths and passes absolute urls through', async () => {
    store.setToken('tok');
    fetchMock.mockResolvedValue(res(200));
    const { authFetch } = await import('../authFetch');

    await authFetch('/api/x');
    await authFetch('http://other/y');

    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/x');
    expect(fetchMock.mock.calls[1][0]).toBe('http://other/y');
  });
});
