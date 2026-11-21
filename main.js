import Phaser from "phaser";
import "./style.css";
import {loadState,saveState,calculateOffline,upgradeCost,incomePerSecond} from "./game-state.js";
import {initCloud,uploadCloudSave,downloadCloudSave} from "./cloud.js";
import {initMonetization,showRewardedAd,buyProduct} from "./monetization.js";

let state=loadState(), activeTab="shops", gameScene=null;
const $=id=>document.getElementById(id);
const money=n=>Math.floor(n).toLocaleString("th-TH");
function persist(){saveState(state);uploadCloudSave(state)}
function notify(msg){const el=document.createElement("div");el.textContent=msg;el.style.cssText="position:fixed;z-index:10;bottom:18px;left:50%;transform:translateX(-50%);background:#f4b942;color:#172033;padding:10px 16px;border-radius:12px;font-weight:700;box-shadow:0 5px 20px #0008";document.body.append(el);setTimeout(()=>el.remove(),2200)}
function renderHeader(){$("coins").textContent=money(state.coins);$("gems").textContent=money(state.gems);$("level").textContent=`เลเวล ${state.level}`}
function renderTab(){
 const root=$("tab-content");root.innerHTML="";
 if(activeTab==="shops"){
  state.shops.forEach(shop=>{
   const card=document.createElement("article");card.className="shop-card";
   const cost=shop.owned?upgradeCost(shop):shop.cost;
   card.innerHTML=`<h3>${shop.emoji} ${shop.name}</h3><div class="muted">${shop.owned?`ระดับ ${shop.level} • รายได้ ${money(shop.income*shop.level)}/วินาที`:"ร้านใหม่ • ปลดล็อกเพื่อสร้างรายได้"}</div><div class="shop-actions"><button class="action" data-id="${shop.id}">${shop.owned?"อัปเกรด":"เปิดร้าน"} · 🪙 ${money(cost)}</button>${shop.owned?`<button class="action secondary" data-collect="${shop.id}">เก็บ</button>`:""}</div>`;
   root.append(card);
  });
  root.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{const s=state.shops.find(x=>x.id===b.dataset.id),cost=s.owned?upgradeCost(s):s.cost;if(state.coins<cost){notify("เงินไม่พอ ลองเก็บรายได้ก่อน");return}state.coins-=cost;s.owned=true;s.level++;state.level=Math.max(state.level,1+Math.floor(state.shops.filter(x=>x.owned).length/2));persist();render()});
  root.querySelectorAll("[data-collect]").forEach(b=>b.onclick=()=>{const s=state.shops.find(x=>x.id===b.dataset.collect);const reward=s.income*s.level*20;state.coins+=reward;state.totalEarned+=reward;persist();render();notify(`รับรายได้ ${money(reward)} เหรียญ`)});
 }else if(activeTab==="missions"){
  const missions=[["first","เปิดร้านที่ 2",state.shops.filter(s=>s.owned).length>=2,50],["upgrade","อัปเกรดร้านให้ถึงระดับ 3",state.shops.some(s=>s.level>=3),100],["wealth","มีเงินสะสม 1,000 เหรียญ",state.coins>=1000,75]];
  missions.forEach(([id,name,done,reward])=>{const c=document.createElement("article");c.className="mission-card";const claimed=state.missionsClaimed.includes(id);c.innerHTML=`<h3>🎯 ${name}</h3><div class="muted">รางวัล 🪙 ${reward}</div><button class="action" ${!done||claimed?"disabled":""}>${claimed?"รับแล้ว":done?"รับรางวัล":"ยังไม่สำเร็จ"}</button>`;c.querySelector("button").onclick=()=>{if(done&&!claimed){state.coins+=reward;state.missionsClaimed.push(id);persist();render()}};root.append(c)});
  const ad=document.createElement("article");ad.className="mission-card";ad.innerHTML='<h3>📺 โบนัสโฆษณา</h3><div class="muted">ดูวิดีโอสมัครใจเพื่อรับโบนัส 2 เท่าของรายได้ 60 วินาที</div><button class="action">ดูโฆษณารับรางวัล</button>';ad.querySelector("button").onclick=async()=>{const result=await showRewardedAd(()=>{const reward=incomePerSecond(state)*120;state.coins+=reward;persist();render();notify(`โบนัส ${money(reward)} เหรียญ`)});if(!result.ok)notify(result.reason)};root.append(ad);
 }else{
  const products=[["starter","Starter Pack","แพ็กเริ่มต้น • สินค้าซื้อครั้งเดียว","฿29"],["gems100","100 เพชร","เติมเพชรสำหรับของพิเศษ","฿59"],["gems300","300 เพชร","แพ็กคุ้มค่า","฿149"],["vip30","VIP 30 วัน","สมาชิกพิเศษ 30 วัน","฿99"]];
  products.forEach(([id,name,desc,price])=>{const c=document.createElement("article");c.className="store-card";c.innerHTML=`<h3>💎 ${name}</h3><div class="muted">${desc}</div><div class="price">${price}</div><button class="action">ซื้อผ่าน Google Play</button>`;c.querySelector("button").onclick=async()=>{const r=await buyProduct(id);notify(r.ok?"ซื้อสำเร็จ โปรดตรวจสอบสิทธิ์สินค้า":r.reason||"ซื้อไม่สำเร็จ")};root.append(c)});
 }
}
function render(){renderHeader();renderTab();gameScene?.drawMarket()}
class MarketScene extends Phaser.Scene{
 constructor(){super("market")}
 create(){gameScene=this;this.drawMarket()}
 drawMarket(){
  if(!this.add)return;this.children.removeAll();
  const w=this.scale.width,h=this.scale.height;
  this.add.rectangle(w/2,h/2,w,h,0x18394a);
  for(let y=0;y<4;y++)for(let x=0;x<6;x++){const px=w/2+(x-y)*34,py=30+(x+y)*22;this.add.ellipse(px,py,76,38,0x275b52).setStrokeStyle(1,0x397766)}
  const owned=state.shops.filter(s=>s.owned);
  owned.forEach((s,i)=>{const col=i%3,row=Math.floor(i/3),x=w/2+(col-1)*Math.min(125,w*.25),y=h*.48+row*95;const g=this.add.container(x,y);g.add(this.add.ellipse(0,24,100,28,0x08121b,.35));g.add(this.add.rectangle(0,0,86,48,0xf0b84d).setStrokeStyle(3,0x75431f));g.add(this.add.rectangle(0,-20,96,13,0x9a4638).setStrokeStyle(2,0xf5d28a));g.add(this.add.text(0,-1,s.emoji,{fontSize:"25px"}).setOrigin(.5));g.add(this.add.text(0,42,`${s.name} Lv.${s.level}`,{fontSize:"11px",color:"#fff",backgroundColor:"#142334",padding:{x:4,y:2}}).setOrigin(.5));g.setSize(100,80);g.setInteractive(new Phaser.Geom.Rectangle(-50,-35,100,85),Phaser.Geom.Rectangle.Contains);g.on("pointerdown",()=>{const reward=s.income*s.level*20;state.coins+=reward;state.totalEarned+=reward;persist();renderHeader();notify(`+${money(reward)} เหรียญ`)})});
  this.add.text(12,12,"🌙 ตลาดกลางคืนของคุณ",{fontSize:"15px",color:"#fff",fontStyle:"bold"});
 }
}
const config={type:Phaser.AUTO,parent:"game",backgroundColor:"#18394a",scale:{mode:Phaser.Scale.RESIZE,width:"100%",height:"100%"},scene:[MarketScene],render:{antialias:true}};
new Phaser.Game(config);
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));renderTab()});
const offline=calculateOffline(state);if(offline>0){state.coins+=offline;notify(`ยินดีต้อนรับกลับ! รายได้ออฟไลน์ ${money(offline)} เหรียญ`)}
state.lastSeen=Date.now();persist();render();
setInterval(()=>{const gain=incomePerSecond(state);if(gain>0){state.coins+=gain;state.totalEarned+=gain;renderHeader()}},1000);
setInterval(persist,15000);
document.addEventListener("visibilitychange",()=>{if(document.hidden)persist()});
window.addEventListener("beforeunload",persist);
(async()=>{const cloud=await initCloud();if(cloud){const remote=await downloadCloudSave();if(remote&&remote.lastSeen>state.lastSeen){state=remote;render();notify("โหลดข้อมูล Cloud แล้ว")}}await initMonetization()})();
