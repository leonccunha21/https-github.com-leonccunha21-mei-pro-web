import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, Sale, Category, StoreInfo, ServiceOrder } from '../types';

/**
 * Store Info
 */
export async function loadUserStoreInfo(userId: string): Promise<StoreInfo | null> {
  const path = `users/${userId}/config/storeInfo`;
  try {
    const docRef = doc(db, path);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as StoreInfo) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveUserStoreInfo(userId: string, info: StoreInfo): Promise<void> {
  const path = `users/${userId}/config/storeInfo`;
  try {
    const docRef = doc(db, path);
    await setDoc(docRef, info);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Products
 */
export async function loadUserProducts(userId: string): Promise<Product[]> {
  const path = `users/${userId}/products`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: Product[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as Product);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveUserProduct(userId: string, product: Product): Promise<void> {
  const path = `users/${userId}/products`;
  try {
    const docRef = doc(db, path, product.id);
    await setDoc(docRef, product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${product.id}`);
  }
}

export async function deleteUserProduct(userId: string, productId: string): Promise<void> {
  const path = `users/${userId}/products`;
  try {
    const docRef = doc(db, path, productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${productId}`);
  }
}

/**
 * Categories
 */
export async function loadUserCategories(userId: string): Promise<Category[]> {
  const path = `users/${userId}/categories`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: Category[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as Category);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveUserCategory(userId: string, category: Category): Promise<void> {
  const path = `users/${userId}/categories`;
  try {
    const docRef = doc(db, path, category.id);
    await setDoc(docRef, category);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${category.id}`);
  }
}

/**
 * Sales
 */
export async function loadUserSales(userId: string): Promise<Sale[]> {
  const path = `users/${userId}/sales`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: Sale[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as Sale);
    });
    // Sort sales by date descending (newest first)
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveUserSale(userId: string, sale: Sale): Promise<void> {
  const path = `users/${userId}/sales`;
  try {
    const docRef = doc(db, path, sale.id);
    await setDoc(docRef, sale);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${sale.id}`);
  }
}

export async function clearUserProducts(userId: string): Promise<void> {
  const path = `users/${userId}/products`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    for (const d of querySnapshot.docs) {
      await deleteDoc(d.ref);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearUserCategories(userId: string): Promise<void> {
  const path = `users/${userId}/categories`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    for (const d of querySnapshot.docs) {
      await deleteDoc(d.ref);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearUserSales(userId: string): Promise<void> {
  const path = `users/${userId}/sales`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    for (const d of querySnapshot.docs) {
      await deleteDoc(d.ref);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Service Orders (OS / Orçamentos)
 */
export async function loadUserOrders(userId: string): Promise<ServiceOrder[]> {
  const path = `users/${userId}/orders`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: ServiceOrder[] = [];
    querySnapshot.forEach((d) => {
      items.push(d.data() as ServiceOrder);
    });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveUserOrder(userId: string, order: ServiceOrder): Promise<void> {
  const path = `users/${userId}/orders`;
  try {
    const docRef = doc(db, path, order.id);
    await setDoc(docRef, order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${order.id}`);
  }
}

export async function deleteUserOrder(userId: string, orderId: string): Promise<void> {
  const path = `users/${userId}/orders`;
  try {
    const docRef = doc(db, path, orderId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${orderId}`);
  }
}

export async function clearUserOrders(userId: string): Promise<void> {
  const path = `users/${userId}/orders`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    for (const d of querySnapshot.docs) {
      await deleteDoc(d.ref);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Batched Cloud Sync Operations (to support fast massive uploads/updates)
 */
export async function saveUserProductsBatch(userId: string, products: Product[]): Promise<void> {
  const path = `users/${userId}/products`;
  try {
    const chunkSize = 500;
    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const p of chunk) {
        const docRef = doc(db, path, p.id);
        batch.set(docRef, p);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveUserCategoriesBatch(userId: string, categories: Category[]): Promise<void> {
  const path = `users/${userId}/categories`;
  try {
    const chunkSize = 500;
    for (let i = 0; i < categories.length; i += chunkSize) {
      const chunk = categories.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const c of chunk) {
        const docRef = doc(db, path, c.id);
        batch.set(docRef, c);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveUserSalesBatch(userId: string, sales: Sale[]): Promise<void> {
  const path = `users/${userId}/sales`;
  try {
    const chunkSize = 500;
    for (let i = 0; i < sales.length; i += chunkSize) {
      const chunk = sales.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const s of chunk) {
        const docRef = doc(db, path, s.id);
        batch.set(docRef, s);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}


