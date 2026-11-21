import test from "node:test";
import assert from "node:assert/strict";
import {DEFAULT_STATE,calculateOffline,upgradeCost,incomePerSecond,loadState,saveState} from "../src/game-state.js";
test("default state has starter shop and currency",()=>{assert.equal(DEFAULT_STATE.coins,500);assert.equal(DEFAULT_STATE.shops[0].owned,true)});
test("offline earnings capped at eight hours",()=>{const s=structuredClone(DEFAULT_STATE);s.lastSeen=0;assert.equal(calculateOffline(s,24*60*60*1000),Math.floor(8*60*60*3*.35))});
test("upgrade price grows with level",()=>{const s=DEFAULT_STATE.shops[0];assert.ok(upgradeCost({...s,level:2})>upgradeCost({...s,level:1}))});
test("income sums owned shops only",()=>{assert.equal(incomePerSecond(DEFAULT_STATE),3)});
test("save and load roundtrip",()=>{const m=new Map();const storage={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};saveState(DEFAULT_STATE,storage);assert.equal(loadState(storage).coins,500)});
