async function getCollection(collectionName) {
  const colRef = window.firestore.collection(db, collectionName);
  const snapshot = await window.firestore.getDocs(colRef);
  
  return snapshot.docs.map(doc => {
    const data = { docId: doc.id, ...doc.data() };
    
    // Xóa password trước khi trả về
    if (collectionName === 'users') {
      delete data.password;
    }
    
    return data;
  });
}
