import {AdMob,RewardAdPluginEvents} from "@capacitor-community/admob";
import {Purchases,LOG_LEVEL} from "@capgo/native-purchases";
import {ADMOB_TEST_MODE,ADMOB_REWARDED_AD_UNIT_ID,REVENUECAT_ANDROID_API_KEY,PRODUCT_IDS} from "./config.js";
import {Capacitor} from "@capacitor/core";
let adReady=false;
export async function initMonetization(){
  if(!Capacitor.isNativePlatform())return;
  try{
    await AdMob.initialize({initializeForTesting:ADMOB_TEST_MODE});
    if(ADMOB_REWARDED_AD_UNIT_ID){
      await AdMob.prepareRewardVideoAd({adId:ADMOB_REWARDED_AD_UNIT_ID});
      adReady=true;
    }
  }catch(e){console.warn("AdMob init:",e)}
  if(REVENUECAT_ANDROID_API_KEY){
    try{await Purchases.setLogLevel({level:LOG_LEVEL.DEBUG});await Purchases.configure({apiKey:REVENUECAT_ANDROID_API_KEY})}
    catch(e){console.warn("Purchases init:",e)}
  }
}
export async function showRewardedAd(onReward){
  if(!Capacitor.isNativePlatform()||!adReady) return {ok:false,reason:"ยังไม่ได้ตั้งค่าโฆษณา"};
  try{
    let earned=false;
    const listener=await AdMob.addListener(RewardAdPluginEvents.Rewarded,()=>{earned=true;onReward?.()});
    await AdMob.showRewardVideoAd();
    await listener.remove();
    return {ok:earned,reason:earned?"ได้รับรางวัลแล้ว":"ดูโฆษณาไม่สำเร็จ"};
  }catch(e){return {ok:false,reason:"ไม่สามารถแสดงโฆษณาได้"}}
}
export async function buyProduct(productKey){
  if(!Capacitor.isNativePlatform())return {ok:false,reason:"การซื้อเงินจริงใช้ได้ในแอป Android ที่เผยแพร่/ทดสอบผ่าน Google Play เท่านั้น"};
  if(!REVENUECAT_ANDROID_API_KEY)return {ok:false,reason:"ยังไม่ได้ตั้งค่า RevenueCat"};
  try{
    const {products}=await Purchases.getProducts({productIdentifiers:[PRODUCT_IDS[productKey]],productCategory:"NON_SUBSCRIPTION"});
    if(!products?.length)return {ok:false,reason:"ไม่พบสินค้า กรุณาตรวจสอบ Product ID"};
    const result=await Purchases.purchaseStoreProduct({product:products[0]});
    return {ok:!!result?.customerInfo,customerInfo:result?.customerInfo};
  }catch(e){return {ok:false,reason:"การซื้อถูกยกเลิกหรือไม่สำเร็จ"}}
}
// สำหรับ production ต้องตรวจ entitlement/receipt ฝั่ง RevenueCat และให้ Google Play เป็นผู้ยืนยันธุรกรรม
