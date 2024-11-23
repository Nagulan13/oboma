// firestoreService.js
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from './firebaseConfig'; // Ensure this path is correct based on your project structure

export const fetchUserType = async (uid) => {
  console.log('Fetching user type for UID:', uid); // Debug log
  const adminDoc = await getDoc(doc(db, 'admin', uid));
  if (adminDoc.exists()) {
    return 'admin';
  }

  const staffDoc = await getDoc(doc(db, 'staff', uid));
  if (staffDoc.exists()) {
    return 'staff';
  }

  const customerDoc = await getDoc(doc(db, 'customer', uid));
  if (customerDoc.exists()) {
    return 'customer';
  }

  throw new Error(`User with UID ${uid} does not exist in any collection`);
};

export const fetchUserDetails = async (uid, userType) => {
  console.log('Fetching user details for UID:', uid, 'User Type:', userType); // Debug log
  const userDoc = await getDoc(doc(db, userType, uid));
  if (!userDoc.exists()) {
    throw new Error(`No user found in ${userType} collection with UID ${uid}`);
  }
  return userDoc.data();
};

export const createUserProfile = async (uid, profileData, userType) => {
  console.log('Creating user profile for UID:', uid, 'User Type:', userType); // Debug log
  await setDoc(doc(db, userType, uid), profileData);
};

export const uploadProfilePicture = async (uri, userId) => {
  try {
    console.log('Uploading profile picture for UID:', userId); // Debug log
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `${userId}_${new Date().getTime()}`;
    const storageRef = ref(storage, `profile_pictures/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error('Upload error: ', error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
        }
      );
    });
  } catch (error) {
    console.error('Upload to storage error: ', error);
    throw error;
  }
};
