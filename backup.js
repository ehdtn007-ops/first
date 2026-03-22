const admin = require('firebase-admin');
const XLSX = require('xlsx');
const fs = require('fs');

// GitHub Secret에서 서비스 계정 키 로드
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'bssbs-25cc1'
});

const db = admin.firestore();

async function runBackup() {
  const now = new Date();
  // 한국 시간으로 표시
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const pad = n => String(n).padStart(2, '0');
  const docId = `${kst.getFullYear()}${pad(kst.getMonth()+1)}${pad(kst.getDate())}_${pad(kst.getHours())}${pad(kst.getMinutes())}${pad(kst.getSeconds())}`;

  console.log(`[${docId}] 백업 시작...`);

  // 1. base_listings 수집
  const baseSnap = await db.collection('base_listings').get();
  const baseListings = [];
  baseSnap.forEach(doc => {
    const d = doc.data();
    if (!d._deleted) baseListings.push({ ...d, _owner: '기본' });
  });

  // 2. users의 listings 수집
  const usersSnap = await db.collection('users').get();
  const userListings = [];
  usersSnap.forEach(doc => {
    const u = doc.data();
    if (u.role === 'master' || !u.listings) return;
    u.listings.filter(l => !l._deleted).forEach(l => {
      userListings.push({ ...l, _owner: u.name, _ownerId: u.id });
    });
  });

  const all = [...baseListings, ...userListings];
  console.log(`총 ${all.length}건 수집 완료`);

  // 3. Firestore backups 컬렉션에 저장
  await db.collection('backups').doc(docId).set({
    createdAt: admin.firestore.Timestamp.now().toMillis(),
    totalCount: all.length,
    listings: all,
    source: 'github-actions'
  });
  console.log(`Firestore 저장 완료: backups/${docId}`);

  // 4. 오래된 백업 자동 정리 (90일 이상)
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const oldSnap = await db.collection('backups')
    .where('createdAt', '<', cutoff)
    .get();
  const deleteJobs = oldSnap.docs.map(d => d.ref.delete());
  if (deleteJobs.length > 0) {
    await Promise.all(deleteJobs);
    console.log(`오래된 백업 ${deleteJobs.length}개 삭제`);
  }

  // 5. 백업 설정 lastBackup 갱신
  await db.collection('settings').doc('backup').set(
    { lastBackup: Date.now(), lastSource: 'github-actions' },
    { merge: true }
  );

  console.log(`[${docId}] 백업 완료!`);
}

runBackup().catch(e => {
  console.error('백업 실패:', e);
  process.exit(1);
});
