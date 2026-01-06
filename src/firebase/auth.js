// /src/firebase/auth.js
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, signOut } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { auth, firestore } from './firebase';

// LOGIN FUNCTION
export const login = async (email, password) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await cred.user.reload();

    if (!cred.user.emailVerified) {
      await signOut(auth);
      return { success: false, message: "Please verify your email before logging in." };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// SIGNUP FUNCTION
export const signUpUser = async (name, email, password) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(firestore, 'users', cred.user.uid), {
      fullName: name,
      email,
      createdAt: new Date(),
    });

    await sendEmailVerification(cred.user);
    await signOut(auth);

    return {
      success: true,
      message: "Account created! Verification email sent."
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// FORGOT PASSWORD
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent." };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

