import { browser } from 'webextension-polyfill-ts'

export const saveLocal = async (key: string, value: string) => {
  await browser.storage.local.set({ [key]: value })
}

export const removeLocal = async (key: string) => {
  await browser.storage.local.remove(key)
}

export const getLocal = async (key: string): Promise<string> => {
  const local = await browser.storage.local.get(key)
  return local[key]
}

////////////////////////// UI storage //////////////////////////
export enum StorageKeys {
  MNEMONICS = 'TWIN_MNEMONICS',
  ACCOUNTS = 'TWIN_ACCOUNTS',
  MNEMONICS_CREATING = 'MNEMONICS_CREATING',
  SHARING_NFT_META = 'SHARING_NFT_META',
  LOGINED_ACCOUNT = 'LOGINED_ACCOUNT'
}

export const saveMnenonics = async (mnemonics: string) => {
  await browser.storage.local.set({
    [StorageKeys.MNEMONICS]: mnemonics
  })
}

export const getMnemonics = async (): Promise<string> => {
  const local = await browser.storage.local.get(StorageKeys.MNEMONICS)
  return local[StorageKeys.MNEMONICS] || ''
}

export const hasCreated = async () => {
  const mnemonics = await getLocal(StorageKeys.MNEMONICS)
  return mnemonics && mnemonics !== ''
}
