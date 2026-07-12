import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, Sale, Category } from '../types';

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
