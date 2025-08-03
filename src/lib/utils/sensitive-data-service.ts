/**
 * Sensitive Data Service
 * Provides functions for storing and retrieving encrypted sensitive data
 */

import { prisma } from '@/lib/db/prisma';
import { encrypt, decrypt } from './encryption';

/**
 * Store sensitive data with encryption
 * @param userId The user ID
 * @param dataType The type of data (e.g., 'personal', 'payment')
 * @param dataKey The key for the data (e.g., 'phone', 'address')
 * @param dataValue The value to encrypt and store
 */
export async function storeSensitiveData(
  userId: string,
  dataType: string,
  dataKey: string,
  dataValue: string
): Promise<void> {
  try {
    // Encrypt the data value
    const encryptedValue = encrypt(dataValue);
    
    // Store or update the data in the database
    await prisma.sensitiveData.upsert({
      where: {
        userId_dataType_dataKey: {
          userId,
          dataType,
          dataKey,
        },
      },
      update: {
        dataValue: encryptedValue,
        updatedAt: new Date(),
      },
      create: {
        userId,
        dataType,
        dataKey,
        dataValue: encryptedValue,
      },
    });
    
    // Log the data access for audit purposes
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DATA_WRITE',
        entityType: 'SENSITIVE_DATA',
        entityId: `${userId}:${dataType}:${dataKey}`,
        description: `Updated sensitive data: ${dataType}/${dataKey}`,
      },
    });
  } catch (error) {
    console.error(`Error storing sensitive data (${dataType}/${dataKey}):`, error);
    throw new Error(`Failed to store sensitive data`);
  }
}

/**
 * Retrieve sensitive data with decryption
 * @param userId The user ID
 * @param dataType The type of data (e.g., 'personal', 'payment')
 * @param dataKey The key for the data (e.g., 'phone', 'address')
 * @returns The decrypted data value or null if not found
 */
export async function getSensitiveData(
  userId: string,
  dataType: string,
  dataKey: string
): Promise<string | null> {
  try {
    // Get the encrypted data from the database
    const data = await prisma.sensitiveData.findUnique({
      where: {
        userId_dataType_dataKey: {
          userId,
          dataType,
          dataKey,
        },
      },
    });
    
    if (!data) {
      return null;
    }
    
    // Log the data access for audit purposes
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DATA_READ',
        entityType: 'SENSITIVE_DATA',
        entityId: `${userId}:${dataType}:${dataKey}`,
        description: `Read sensitive data: ${dataType}/${dataKey}`,
      },
    });
    
    // Decrypt the data value before returning
    return decrypt(data.dataValue);
  } catch (error) {
    console.error(`Error retrieving sensitive data (${dataType}/${dataKey}):`, error);
    return null;
  }
}

/**
 * Delete sensitive data
 * @param userId The user ID
 * @param dataType The type of data (e.g., 'personal', 'payment')
 * @param dataKey The key for the data (e.g., 'phone', 'address')
 */
export async function deleteSensitiveData(
  userId: string,
  dataType: string,
  dataKey: string
): Promise<void> {
  try {
    await prisma.sensitiveData.delete({
      where: {
        userId_dataType_dataKey: {
          userId,
          dataType,
          dataKey,
        },
      },
    });
    
    // Log the data deletion for audit purposes
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DATA_DELETE',
        entityType: 'SENSITIVE_DATA',
        entityId: `${userId}:${dataType}:${dataKey}`,
        description: `Deleted sensitive data: ${dataType}/${dataKey}`,
      },
    });
  } catch (error) {
    console.error(`Error deleting sensitive data (${dataType}/${dataKey}):`, error);
    // Don't throw an error if the data doesn't exist
  }
}

/**
 * Get all sensitive data for a user of a specific type
 * @param userId The user ID
 * @param dataType The type of data (e.g., 'personal', 'payment')
 * @returns An object with decrypted values mapped by their keys
 */
export async function getAllSensitiveDataByType(
  userId: string,
  dataType: string
): Promise<Record<string, string>> {
  try {
    // Get all encrypted data of the specified type
    const dataItems = await prisma.sensitiveData.findMany({
      where: {
        userId,
        dataType,
      },
    });
    
    // Create a map of decrypted values
    const result: Record<string, string> = {};
    
    for (const item of dataItems) {
      result[item.dataKey] = decrypt(item.dataValue);
    }
    
    // Log the data access for audit purposes
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DATA_READ_BULK',
        entityType: 'SENSITIVE_DATA',
        entityId: `${userId}:${dataType}`,
        description: `Read all sensitive data of type: ${dataType}`,
      },
    });
    
    return result;
  } catch (error) {
    console.error(`Error retrieving all sensitive data of type ${dataType}:`, error);
    return {};
  }
}

/**
 * Delete all sensitive data for a user
 * @param userId The user ID
 */
export async function deleteAllSensitiveData(userId: string): Promise<void> {
  try {
    await prisma.sensitiveData.deleteMany({
      where: {
        userId,
      },
    });
    
    // Log the data deletion for audit purposes
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DATA_DELETE_ALL',
        entityType: 'SENSITIVE_DATA',
        entityId: userId,
        description: `Deleted all sensitive data for user`,
      },
    });
  } catch (error) {
    console.error(`Error deleting all sensitive data for user ${userId}:`, error);
    throw new Error('Failed to delete all sensitive data');
  }
}