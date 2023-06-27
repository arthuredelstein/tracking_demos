const digits = Math.random().toString().substring(2);
document.cookie = `test=${digits}; max-age=10000`;
