// Firebase Configuration
// Thay thế các giá trị bên dưới bằng config từ Firebase Console của bạn

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
