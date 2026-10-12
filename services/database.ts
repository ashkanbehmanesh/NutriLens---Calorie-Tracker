
import { db, auth, doc, setDoc, getDoc, collection, query, getDocs, deleteDoc, updateDoc, orderBy } from "../firebase";
import { UserProfile, Meal, WeightLog, FavoriteFood } from "../types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const saveUserProfile = async (uid: string, profile: UserProfile) => {
  const path = `users/${uid}`;
  try {
    // Remove undefined values as Firestore does not support them
    const cleanProfile = Object.fromEntries(
      Object.entries(profile).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(db, "users", uid), { profile: cleanProfile });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return docSnap.data().profile as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const addMealToDb = async (uid: string, meal: Meal) => {
  const path = `users/${uid}/meals/${meal.id}`;
  try {
    const cleanMeal = Object.fromEntries(
      Object.entries(meal).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(db, "users", uid, "meals", meal.id), cleanMeal);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateMealInDb = async (uid: string, meal: Meal) => {
  const path = `users/${uid}/meals/${meal.id}`;
  try {
    const cleanMeal = Object.fromEntries(
      Object.entries(meal).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(db, "users", uid, "meals", meal.id), cleanMeal);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteMealFromDb = async (uid: string, mealId: string) => {
  const path = `users/${uid}/meals/${mealId}`;
  try {
    await deleteDoc(doc(db, "users", uid, "meals", mealId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const getMealsFromDb = async (uid: string): Promise<Meal[]> => {
  const path = `users/${uid}/meals`;
  try {
    const q = query(collection(db, "users", uid, "meals"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const meals: Meal[] = [];
    querySnapshot.forEach((doc) => {
      meals.push(doc.data() as Meal);
    });
    return meals;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addWeightLogToDb = async (uid: string, log: WeightLog) => {
  const path = `users/${uid}/weightLogs/${log.id}`;
  try {
    const cleanLog = Object.fromEntries(
      Object.entries(log).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(db, "users", uid, "weightLogs", log.id), cleanLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getWeightLogsFromDb = async (uid: string): Promise<WeightLog[]> => {
  const path = `users/${uid}/weightLogs`;
  try {
    const q = query(collection(db, "users", uid, "weightLogs"), orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    const logs: WeightLog[] = [];
    querySnapshot.forEach((doc) => {
      logs.push(doc.data() as WeightLog);
    });
    return logs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addFavoriteToDb = async (uid: string, item: FavoriteFood) => {
  const path = `users/${uid}/favorites/${item.id}`;
  try {
    const cleanItem = Object.fromEntries(
      Object.entries(item).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(db, "users", uid, "favorites", item.id), cleanItem);
    // Also cache to localStorage
    const localKey = `nutrilens_favs_${uid}`;
    const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
    const updated = [cleanItem, ...cached.filter((f: any) => f.id !== item.id)];
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (error) {
    // If firestore fails (e.g. security rules), cache in localStorage
    const localKey = `nutrilens_favs_${uid}`;
    const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
    const updated = [item, ...cached.filter((f: any) => f.id !== item.id)];
    localStorage.setItem(localKey, JSON.stringify(updated));
    console.warn("Saved favorite to localStorage:", error);
  }
};

export const deleteFavoriteFromDb = async (uid: string, favoriteId: string) => {
  const path = `users/${uid}/favorites/${favoriteId}`;
  try {
    await deleteDoc(doc(db, "users", uid, "favorites", favoriteId));
    const localKey = `nutrilens_favs_${uid}`;
    const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify(cached.filter((f: any) => f.id !== favoriteId)));
  } catch (error) {
    const localKey = `nutrilens_favs_${uid}`;
    const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify(cached.filter((f: any) => f.id !== favoriteId)));
    console.warn("Deleted favorite from localStorage:", error);
  }
};

export const getFavoritesFromDb = async (uid: string): Promise<FavoriteFood[]> => {
  const localKey = `nutrilens_favs_${uid}`;
  const localData: FavoriteFood[] = JSON.parse(localStorage.getItem(localKey) || '[]');
  const path = `users/${uid}/favorites`;

  try {
    const q = query(collection(db, "users", uid, "favorites"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const favorites: FavoriteFood[] = [];
    querySnapshot.forEach((doc) => {
      favorites.push(doc.data() as FavoriteFood);
    });

    if (favorites.length > 0) {
      localStorage.setItem(localKey, JSON.stringify(favorites));
      return favorites;
    }
    return localData;
  } catch (error) {
    try {
      const qFallback = query(collection(db, "users", uid, "favorites"));
      const querySnapshotFallback = await getDocs(qFallback);
      const favorites: FavoriteFood[] = [];
      querySnapshotFallback.forEach((doc) => {
        favorites.push(doc.data() as FavoriteFood);
      });
      if (favorites.length > 0) {
        localStorage.setItem(localKey, JSON.stringify(favorites));
        return favorites;
      }
    } catch (e) {
      console.warn("Using offline favorites storage:", e);
    }
    return localData;
  }
};

