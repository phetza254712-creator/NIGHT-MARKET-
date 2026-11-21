
import {
  AdMob,
  RewardAdPluginEvents
} from "@capacitor-community/admob";

import {
  NativePurchases,
  PURCHASE_TYPE
} from "@capgo/native-purchases";

import {
  ADMOB_TEST_MODE,
  ADMOB_REWARDED_AD_UNIT_ID,
  PRODUCT_IDS
} from "./config.js";

import { Capacitor } from "@capacitor/core";

let adReady = false;
let billingReady = false;

export async function initMonetization() {
  if (!Capacitor.isNativePlatform()) return;

  // Do not initialize AdMob until an Ad Unit ID is configured.
  // AdMob also requires an Application ID in AndroidManifest.xml.
  if (ADMOB_REWARDED_AD_UNIT_ID) {
    try {
      await AdMob.initialize({
        initializeForTesting: ADMOB_TEST_MODE
      });

      await AdMob.prepareRewardVideoAd({
        adId: ADMOB_REWARDED_AD_UNIT_ID
      });

      adReady = true;
    } catch (error) {
      adReady = false;
      console.warn("AdMob initialization failed:", error);
    }
  } else {
    console.info("AdMob skipped: no Rewarded Ad Unit ID configured.");
  }

  // Initialize Google Play Billing independently.
  try {
    const result = await NativePurchases.isBillingSupported();
    billingReady = !!result?.isBillingSupported;

    if (!billingReady) {
      console.warn("Google Play Billing is not supported.");
    }
  } catch (error) {
    billingReady = false;
    console.warn("Billing initialization failed:", error);
  }
}

export async function showRewardedAd(onReward) {
  if (!Capacitor.isNativePlatform() || !adReady) {
    return {
      ok: false,
      reason: "ยังไม่ได้ตั้งค่าโฆษณา"
    };
  }

  let listener;
  let earned = false;

  try {
    listener = await AdMob.addListener(
      RewardAdPluginEvents.Rewarded,
      () => {
        if (!earned) {
          earned = true;
          onReward?.();
        }
      }
    );

    await AdMob.showRewardVideoAd();

    return {
      ok: earned,
      reason: earned
        ? "ได้รับรางวัลแล้ว"
        : "ดูโฆษณาไม่สำเร็จ"
    };
  } catch (error) {
    console.warn("Rewarded ad failed:", error);

    return {
      ok: false,
      reason: "ไม่สามารถแสดงโฆษณาได้"
    };
  } finally {
    if (listener) {
      await listener.remove();
    }
  }
}

export async function buyProduct(productKey) {
  if (!Capacitor.isNativePlatform()) {
    return {
      ok: false,
      reason: "การซื้อสินค้าใช้ได้ในแอป Android เท่านั้น"
    };
  }

  if (!billingReady) {
    return {
      ok: false,
      reason: "ระบบ Google Play Billing ยังไม่พร้อม"
    };
  }

  const productId = PRODUCT_IDS[productKey];

  if (!productId) {
    return {
      ok: false,
      reason: "ไม่พบรหัสสินค้า"
    };
  }

  try {
    const result = await NativePurchases.getProducts({
      productIdentifiers: [productId],
      productType: PURCHASE_TYPE.INAPP
    });

    if (!result?.products?.length) {
      return {
        ok: false,
        reason: "ไม่พบสินค้า กรุณาตรวจสอบ Product ID ใน Google Play Console"
      };
    }

    const transaction = await NativePurchases.purchaseProduct({
      productIdentifier: productId,
      productType: PURCHASE_TYPE.INAPP,
      quantity: 1
    });

    return {
      ok: !!transaction,
      transaction
    };
  } catch (error) {
    console.warn("Purchase failed:", error);

    return {
      ok: false,
      reason: "การซื้อถูกยกเลิกหรือไม่สำเร็จ"
    };
  }
}
