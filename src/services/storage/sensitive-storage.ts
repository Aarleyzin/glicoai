import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

const CHUNK_SIZE = 1800;
const META_SUFFIX = '.meta';
const CHUNK_PREFIX = '.chunk.';
const SECURE_KEY_PREFIX = 'glicoai.';

type StoredMeta = {
  chunkCount: number;
};

function isWeb() {
  return Platform.OS === 'web';
}

function getSecureStoreKey(key: string) {
  const normalizedKey = key.trim();

  if (!normalizedKey) {
    return null;
  }

  return `${SECURE_KEY_PREFIX}${normalizedKey.replace(/[^A-Za-z0-9._-]/g, '_')}`;
}

function getMetaKey(key: string) {
  return `${key}${META_SUFFIX}`;
}

function getChunkKey(key: string, index: number) {
  return `${key}${CHUNK_PREFIX}${index}`;
}

async function readSecureValue(key: string) {
  const secureKey = getSecureStoreKey(key);

  if (!secureKey) {
    return null;
  }

  const metaRaw = await SecureStore.getItemAsync(getMetaKey(secureKey));

  if (!metaRaw) {
    return null;
  }

  const meta = JSON.parse(metaRaw) as StoredMeta;
  const chunks = await Promise.all(
    Array.from({ length: meta.chunkCount }, (_, index) => SecureStore.getItemAsync(getChunkKey(secureKey, index)))
  );

  if (chunks.some((chunk) => chunk === null)) {
    return null;
  }

  return chunks.join('');
}

async function removeSecureValue(key: string) {
  const secureKey = getSecureStoreKey(key);

  if (!secureKey) {
    return;
  }

  const metaRaw = await SecureStore.getItemAsync(getMetaKey(secureKey));

  if (metaRaw) {
    const meta = JSON.parse(metaRaw) as StoredMeta;

    await Promise.all(
      Array.from({ length: meta.chunkCount }, (_, index) => SecureStore.deleteItemAsync(getChunkKey(secureKey, index)))
    );
  }

  await SecureStore.deleteItemAsync(getMetaKey(secureKey));
}

async function writeSecureValue(key: string, value: string) {
  const secureKey = getSecureStoreKey(key);

  if (!secureKey) {
    return;
  }

  const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) ?? [''];

  await removeSecureValue(key);

  await Promise.all(
    chunks.map((chunk, index) =>
      SecureStore.setItemAsync(getChunkKey(secureKey, index), chunk, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      })
    )
  );

  await SecureStore.setItemAsync(
    getMetaKey(secureKey),
    JSON.stringify({
      chunkCount: chunks.length,
    } satisfies StoredMeta),
    {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    }
  );
}

async function getNativeItem(key: string) {
  try {
    const secureValue = await readSecureValue(key);

    if (secureValue !== null) {
      return secureValue;
    }

    const legacyValue = await AsyncStorage.getItem(key);

    if (legacyValue !== null) {
      await writeSecureValue(key, legacyValue);
      await AsyncStorage.removeItem(key);
    }

    return legacyValue;
  } catch {
    return AsyncStorage.getItem(key);
  }
}

async function setNativeItem(key: string, value: string) {
  try {
    await writeSecureValue(key, value);
    await AsyncStorage.removeItem(key);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function removeNativeItem(key: string) {
  try {
    await removeSecureValue(key);
  } finally {
    await AsyncStorage.removeItem(key);
  }
}

export async function getSensitiveItem(key: string) {
  if (isWeb()) {
    return AsyncStorage.getItem(key);
  }

  return getNativeItem(key);
}

export async function setSensitiveItem(key: string, value: string) {
  if (isWeb()) {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await setNativeItem(key, value);
}

export async function removeSensitiveItem(key: string) {
  if (isWeb()) {
    await AsyncStorage.removeItem(key);
    return;
  }

  await removeNativeItem(key);
}

export const sensitiveStateStorage: StateStorage = {
  getItem: (key) => getSensitiveItem(key),
  setItem: (key, value) => setSensitiveItem(key, value),
  removeItem: (key) => removeSensitiveItem(key),
};

export const sensitiveSessionStorage = {
  getItem: (key: string) => getSensitiveItem(key),
  setItem: (key: string, value: string) => setSensitiveItem(key, value),
  removeItem: (key: string) => removeSensitiveItem(key),
};
