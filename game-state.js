export const DEFAULT_STATE = {
  coins: 500, gems: 10, level: 1, totalEarned: 0, lastSeen: Date.now(),
  shops: [
    {id:"noodles",name:"ร้านก๋วยเตี๋ยว",emoji:"🍜",cost:0,income:3,level:1,owned:true},
    {id:"tea",name:"ร้านชานม",emoji:"🧋",cost:250,income:7,level:0,owned:false},
    {id:"grill",name:"ร้านหมูกระทะ",emoji:"🍢",cost:900,income:18,level:0,owned:false},
    {id:"dessert",name:"ร้านขนมหวาน",emoji:"🍧",cost:2400,income:45,level:0,owned:false},
    {id:"clothes",name:"ร้านเสื้อผ้า",emoji:"👕",cost:6500,income:110,level:0,owned:false},
    {id:"arcade",name:"ร้านเกม",emoji:"🕹️",cost:16000,income:260,level:0,owned:false}
  ],
  missionsClaimed: []
};
const KEY="nmt-save-v1";
export function loadState(storage=globalThis.localStorage){
  try{
    const raw=storage?.getItem(KEY); if(!raw) return structuredClone(DEFAULT_STATE);
    const saved=JSON.parse(raw);
    if(!saved || !Array.isArray(saved.shops) || typeof saved.coins!=="number") throw new Error("invalid save");
    return {...structuredClone(DEFAULT_STATE),...saved,shops:DEFAULT_STATE.shops.map(base=>({...base,...(saved.shops.find(s=>s.id===base.id)||{})}))};
  }catch{return structuredClone(DEFAULT_STATE)}
}
export function saveState(state,storage=globalThis.localStorage){
  try{storage?.setItem(KEY,JSON.stringify({...state,lastSeen:Date.now()}));return true}catch{return false}
}
export function calculateOffline(state,now=Date.now()){
  const lastSeen=Number.isFinite(state.lastSeen)?state.lastSeen:now;
  const seconds=Math.max(0,Math.min(8*60*60,(now-lastSeen)/1000));
  const perSecond=state.shops.filter(s=>s.owned).reduce((n,s)=>n+s.income*s.level,0);
  return Math.floor(seconds*perSecond*.35);
}
export function upgradeCost(shop){const base=shop.cost===0?100:shop.cost*.65;return Math.ceil(base*Math.pow(1.55,Math.max(0,shop.level-1)))}
export function incomePerSecond(state){return state.shops.filter(s=>s.owned).reduce((n,s)=>n+s.income*s.level,0)}
