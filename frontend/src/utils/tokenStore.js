let _token = null;
let _getter = null;

export const setToken = (t) => { _token = t; };
export const getToken = () => _token;
export const setTokenGetter = (fn) => { _getter = fn; };
export const refreshToken = async (options = {}) => {
  if (_token && !options.force) return _token;
  if (_getter) {
    const t = await _getter(options);
    if (t) { _token = t; return t; }
  }
  return _token || null;
};

export const clearToken = () => { _token = null; };
