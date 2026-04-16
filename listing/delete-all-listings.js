const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyD5sY2g4t6M3U82ZJjKwQvi7-o5WuvVFFg",
  authDomain: "my-first-site-fad82.firebaseapp.com",
  projectId: "my-first-site-fad82",
  storageBucket: "my-first-site-fad82.firebasestorage.app",
  messagingSenderId: "841269966344",
  appId: "1:841269966344:web:5f534de3d2588a0ca483bd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function deleteAllListings() {
  try {
    await signInAnonymously(auth);
    console.log('Firebase 익명 인증 성공');

    const snap = await getDocs(collection(db, 'base_listings'));

    if (snap.empty) {
      console.log('base_listings가 비어있습니다. 삭제할 항목 없음.');
      process.exit(0);
    }

    console.log(`총 ${snap.size}건 발견. 삭제 시작...\n`);

    let count = 0;
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const lid = docSnap.id;
      const no = data.no !== undefined ? data.no : '-';
      const name = data.name || '(이름 없음)';
      console.log(`[${count + 1}/${snap.size}] lid: ${lid}  no: ${no}  name: ${name}`);
      await deleteDoc(doc(db, 'base_listings', lid));
      count++;
    }

    console.log(`\n✅ ${count}건 삭제 완료`);
    process.exit(0);
  } catch (error) {
    console.error('삭제 실패:', error.message);
    process.exit(1);
  }
}

deleteAllListings();
