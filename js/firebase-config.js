// Firebase Configuration
// Thay thế các giá trị bên dưới bằng config từ Firebase Console của bạn

const firebaseConfig = {
    apiKey : "AIzaSyD2HdTQJfpGMoxRFMZCmNFl8qV1DtwZQMQ" , 
  authDomain : "shopdom-9c971.firebaseapp.com" , 
  projectId : "shopdom-9c971" , 
  storageBucket : "shopdom-9c971.firebasestorage.app" , 
  messagingSenderId : "517017065100" , 
  appId : "1:517017065100:web:7366d3ca8879c0749bcda9"
};

// Khởi tạo Firebase
let db = null;
let auth = null;

// Initialize Firebase when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Import Firebase modules from CDN
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } =
            await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } =
            await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        // Make Firestore functions globally available
        window.firestore = {
            collection,
            getDocs,
            addDoc,
            updateDoc,
            deleteDoc,
            doc,
            query,
            where
        };

        window.firebaseAuth = {
            signInWithEmailAndPassword,
            createUserWithEmailAndPassword,
            signOut,
            onAuthStateChanged
        };

        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
});

