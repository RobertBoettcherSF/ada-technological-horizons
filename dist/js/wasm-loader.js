// Loads the Ada module and calls its exports. Arithmetic stays in the module.

const STATUS_OK = 0;

export function createSession() {
  return {
    phase: "idle",
    invocations: 0,
    mime: "",
    message: "",
    exports: null,
  };
}

export async function loadAdditionModule(options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const instantiate = options.instantiate ?? WebAssembly.instantiate.bind(WebAssembly);
  const url = options.url ?? new URL("../ath_addition.wasm", import.meta.url);
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Ada module request failed (${response.status})`);
  }
  const mime = response.headers?.get?.("content-type") ?? "";
  const bytes = await response.arrayBuffer();
  const holder = { instance: null };
  const imports = {
    env: {
      __gnat_put_exception() {
        throw new Error("Ada runtime reported an exception");
      },
      __gnat_grow(pages) {
        const memory = holder.instance?.exports?.memory;
        if (!memory) {
          return -1;
        }
        try {
          return memory.grow(pages);
        } catch {
          return -1;
        }
      },
    },
  };
  const { instance } = await instantiate(bytes, imports);
  holder.instance = instance;
  if (typeof instance.exports.adainit !== "function") {
    throw new Error("Ada module is missing adainit");
  }
  if (typeof instance.exports.ath_add_f64 !== "function") {
    throw new Error("Ada module is missing ath_add_f64");
  }
  instance.exports.adainit();
  return {
    mime,
    exports: instance.exports,
  };
}

export function callAddition(session, left, right) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_add_f64(left, right);
  session.invocations += 1;
  if (status !== STATUS_OK) {
    return { status, result: null };
  }
  const result = session.exports.ath_last_sum();
  return { status, result };
}
