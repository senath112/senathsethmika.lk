
'use server';

import { db, storage } from '@/lib/firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

export async function deleteDocument(documentId: string) {
  try {
    const docRef = doc(db, "documents", documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { errors: { firestore: ['Document not found.'] } };
    }

    const documentData = docSnap.data();
    const fileUrl = documentData.fileUrl;

    // Delete the document from Firestore
    await deleteDoc(docRef);

    // If the file is stored in Firebase Storage, delete it from there as well
    if (fileUrl && fileUrl.includes('firebasestorage.googleapis.com')) {
      try {
        const storageRef = ref(storage, fileUrl);
        await deleteObject(storageRef);
      } catch (storageError: any) {
        // If the file doesn't exist in storage, we can ignore the error
        if (storageError.code !== 'storage/object-not-found') {
          console.error("Error deleting file from Storage: ", storageError);
          // We can decide if this should be a critical error. 
          // For now, we'll allow the Firestore document to be deleted even if storage deletion fails.
        }
      }
    }

    return { message: 'Document deleted successfully.' };
  } catch (error) {
    console.error("Error deleting document: ", error);
    return {
      errors: { firestore: ['Failed to delete document.'] }
    }
  }
}
