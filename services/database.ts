
import { db, doc, setDoc, getDoc, collection, query, getDocs, deleteDoc, updateDoc, orderBy } from "../firebase";
import { UserProfile, Meal } from "../types";

export const saveUserProfile = async (uid: string, profile: UserProfile) => {
  await setDoc(doc(db, "users", uid), { profile });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docSnap = await getDoc(doc(db, "users", uid));
  if (docSnap.exists()) {
    return docSnap.data().profile as UserProfile;
  }
  return null;
};

export const addMealToDb = async (uid: string, meal: Meal) => {
  await setDoc(doc(db, "users", uid, "meals", meal.id), meal);
};

export const updateMealInDb = async (uid: string, meal: Meal) => {
  await setDoc(doc(db, "users", uid, "meals", meal.id), meal);
};

export const deleteMealFromDb = async (uid: string, mealId: string) => {
  await deleteDoc(doc(db, "users", uid, "meals", mealId));
};

export const getMealsFromDb = async (uid: string): Promise<Meal[]> => {
  const q = query(collection(db, "users", uid, "meals"), orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);
  const meals: Meal[] = [];
  querySnapshot.forEach((doc) => {
    meals.push(doc.data() as Meal);
  });
  return meals;
};
