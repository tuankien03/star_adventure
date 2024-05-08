import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, query, orderBy, limit, where, addDoc } from "firebase/firestore";
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBkjWOj0nK_BF60be35DLwPO4rzGB89BEs",
    authDomain: "staradventure-989b8.firebaseapp.com",
    projectId: "staradventure-989b8",
    storageBucket: "staradventure-989b8.appspot.com",
    messagingSenderId: "522948616988",
    appId: "1:522948616988:web:cdfeab8c74a767fa99d0d9",
    measurementId: "G-HBWZMYCM6R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const playerCollection = collection(db, "player");

// Retrieve the documents from the collection
const getPlayersEasyLevel = async () => {
    console.log("Getting players");
    const q = query(
        playerCollection,
        where("level", "==", 0), // Filter by level 0
        orderBy("score", "desc"), // Order by score in descending order
        limit(10) // Limit to top 10 players
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
        return doc.data();
    })
};

const getPlayersMediumLevel = async () => {
    console.log("Getting players");
    const q = query(
        playerCollection,
        where("level", "==", 1), // Filter by level 0
        orderBy("score", "desc"), // Order by score in descending order
        limit(10) // Limit to top 10 players
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
        return doc.data();
    })
};

const addPlayer = async (name, score, level) => {
    try {
      // Add a new document with a generated ID
      const docRef = await addDoc(playerCollection, {
        name: name,
        score: score,
        level: level
      });
      console.log("Player added with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding player: ", e);
    }
};

const getPlayersHardLevel = async () => {
    console.log("Getting players");
    const q = query(
        playerCollection,
        where("level", "==", 2), // Filter by level 0
        orderBy("score", "desc"), // Order by score in descending order
        limit(10) // Limit to top 10 players
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
        return doc.data();
    })
};

// Call the function to get players

export { db, getPlayersEasyLevel, getPlayersMediumLevel, getPlayersHardLevel, addPlayer};