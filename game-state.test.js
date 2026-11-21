
import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_STATE,
  calculateOffline,
  upgradeCost,
  incomePerSecond,
  loadState,
  saveState
} from "./game-state.js";

test("default state has starter shop and currency", () => {
  assert.equal(DEFAULT_STATE.coins, 500);
  assert.equal(DEFAULT_STATE.shops[0].owned, true);
});

test("offline earnings capped at eight hours", () => {
  const state = structuredClone(DEFAULT_STATE);
  state.lastSeen = 0;

  assert.equal(
    calculateOffline(state, 24 * 60 * 60 * 1000),
    Math.floor(8 * 60 * 60 * 3 * 0.35)
  );
});

test("upgrade price grows with level", () => {
  const shop = DEFAULT_STATE.shops[0];

  assert.ok(
    upgradeCost({ ...shop, level: 2 }) >
    upgradeCost({ ...shop, level: 1 })
  );
});

test("income sums owned shops only", () => {
  assert.equal(incomePerSecond(DEFAULT_STATE), 3);
});

test("save and load roundtrip", () => {
  const memory = new Map();

  const storage = {
    getItem: key => memory.get(key) || null,
    setItem: (key, value) => memory.set(key, value)
  };

  saveState(DEFAULT_STATE, storage);

  assert.equal(loadState(storage).coins, 500);
});
