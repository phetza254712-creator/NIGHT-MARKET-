import {FIREBASE_CONFIG} from "./config.js";
let db=null, auth=null;
export async function initCloud(){
  if(!FIREBASE_CONFIG) return false;
  try{
    const [{initializeApp},{getAuth,signInAnonymously},{getFirestore}] = await Promise.all([
      import("firebase/app"),import("firebase/auth"),import("firebase/firestore")
    ]);
    const app=initializeApp(FIREBASE_CONFIG);auth=getAuth(app);db=getFirestore(app);
    await signInAnonymously(auth);return true;
  }catch(e){console.warn("Cloud sync not configured:",e);return false}
}
export async function uploadCloudSave(state){
  if(!db||!auth?.currentUser) return false;
  try{
    const {doc,setDoc,serverTimestamp}=await import("firebase/firestore");
    await setDoc(doc(db,"players",auth.currentUser.uid),{save:state,updatedAt:serverTimestamp()},{merge:true});
    return true;
  }catch(e){console.warn("Cloud save failed",e);return false}
}
export async function downloadCloudSave(){
  if(!db||!auth?.currentUser)return null;
  try{
    const {doc,getDoc}=await import("firebase/firestore");
    const snap=await getDoc(doc(db,"players",auth.currentUser.uid));
    return snap.exists()?snap.data().save:null;
  }catch(e){console.warn("Cloud load failed",e);return null}
}
// ต้องตั้ง Firebase Rules ให้ผู้ใช้เข้าถึงได้เฉพาะ document ของ UID ตัวเองก่อนเปิดใช้งานจริง
