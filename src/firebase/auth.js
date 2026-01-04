// /src/firebase/auth.js
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, signOut } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { auth, firestore } from './firebase';

// LOGIN FUNCTION
export const login = async (email, password) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await cred.user.reload();
    console.log("Email verified status:", cred.user.emailVerified); // Debugging
    if (cred.user.emailVerified) {
      alert("Login successful!");
      // Redirect logic here
      return true;
    } else {
      alert("Please verify your email before logging in.");
      await signOut(auth);
      return false;
    }
  } catch (error) {
    alert("Login error: " + error.message);
    console.error("Login error:", error);
    return false;
  }
};

// SIGNUP FUNCTION
export const signup = async (name, email, password) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(firestore, 'users', cred.user.uid), {
      fullName: name,
      email: email,
      createdAt: new Date(),
    });
    await sendEmailVerification(cred.user);
    alert("Account created! A verification email has been sent. Please verify your email before logging in.");
    await signOut(auth);
    return true;
  } catch (error) {
    alert("Signup error: " + error.message);
    console.error("Signup error:", error);
    return false;
  }
};

// FORGOT PASSWORD FUNCTION
export const sendPasswordReset = async (email) => {
  if (!email) {
    alert("Please enter your email first.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent. Check your inbox.");
  } catch (error) {
    alert("Error: " + error.message);
    console.error("Reset error:", error);
  }
};
