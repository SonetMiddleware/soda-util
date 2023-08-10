import { sendMessage, registerMessage } from './message'
import * as MetaMask from './service/metamask'
import * as Web3 from './service/web3'
import { first } from 'lodash-es'
import { getLocal, StorageKeys } from './service/storage'
// import { getLocal, saveLocal, StorageKeys } from '@soda/soda-core-ui'

// message to background
const MessageTypes = {
  Connect_Metamask: 'Connect_Metamask',
  InvokeWeb3Api: 'InvokeWeb3Api'
}
const CHAIN_SUPPORTED = [4, 80001, 1, 137, 'flowmain', 'flowtest']

export const getUserAccount = async (targetChainId?: number) => {
  const res = await connectMetaMask({ targetChainId })
  console.debug('[util-metamask] getUserAccount: ', res)
  let flowAddr
  const resStr = await getLocal(StorageKeys.LOGINED_ACCOUNT)
  if (resStr) {
    try {
      const res: any = JSON.parse(resStr)
      if (res.addr) {
        flowAddr = res.addr
      }
    } catch (e) {
      console.log(e)
    }
  }
  if (flowAddr) {
    return flowAddr
  }
  const { account, chainId } = res
  if (!res) {
    if (flowAddr) {
      return flowAddr
    } else {
      return
    }
  } else if (CHAIN_SUPPORTED.includes(chainId)) {
    return account
  } else {
    return flowAddr
  }
  return ''
}

export const getChainId = async () => {
  try {
    const res: any = await connectMetaMask()
    console.debug('[util-metamask] getChainId: ', res)
    let flowChainId
    const resStr = await getLocal(StorageKeys.LOGINED_ACCOUNT)
    if (resStr) {
      try {
        const res: any = JSON.parse(resStr)
        if (res.chain) {
          flowChainId = res.chain
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (flowChainId) {
      return flowChainId
    }
    if (res.error) {
      if (flowChainId) {
        return flowChainId
      } else {
        return
      }
    } else {
      const { chainId } = res.result
      if (CHAIN_SUPPORTED.includes(chainId)) {
        return Number(chainId)
      } else {
        return flowChainId
      }
    }
    return null
  } catch (e) {
    console.error(e)
    return 0
  }
}

let metamaskInstalled = true
const checkMetamaskInstalled = () => {
  const currentMetaMaskId = 'nkbihfbeogaeaoehlefnkodbefgpgknn'
  try {
    const port = chrome.runtime.connect(currentMetaMaskId)
    port.onDisconnect.addListener((e) => {
      console.debug('[util-metamask] disconnect listener: ', e)
      metamaskInstalled = false
    })
    return true
  } catch (e) {
    console.error('[util-metamask] checkMetamaskInstalled error: ', e)
    return false
  }
}
checkMetamaskInstalled()

export const isMetamaskConnected = () => {
  return metamaskInstalled
}

let cachedWallet: { account: string; chainId: number } = null
export const connectMetaMask = async (request?: { targetChainId?: number }) => {
  try {
    const { accounts, chainId } = await MetaMask.requestAccounts(
      request?.targetChainId
    )
    cachedWallet = {
      account: first(accounts),
      chainId
    }
    return cachedWallet
  } catch (e) {
    console.error('[util-metamask] connectMetaMask error: ', e)
    if (cachedWallet) return cachedWallet
    throw new Error('connect Metamask error: ' + e)
  }
}

async function connectMessageHandler(request: any) {
  const response: any = {}
  if (!isMetamaskConnected()) {
    response.error = 'Metamask not connected'
    return JSON.stringify(response)
  }
  try {
    const res = await connectMetaMask(request)
    response.result = res
  } catch (e) {
    console.error(e)
    response.error = (e as any).message || e
  }
  return response
}

export const invokeWeb3Api = async (request: any) => {
  const response: any = {}
  try {
    // const res: any = await sendMessage({
    //   type: MessageTypes.InvokeWeb3Api,
    //   request
    // })
    const res: any = await invokeWeb3ApiMessageHandler(request)
    return res
  } catch (e) {
    console.error(e)
    response.error = (e as any).message || e
  }
  console.debug('[util-metamask] invokeWeb3Api: ', response)
  return response
}

async function invokeWeb3ApiMessageHandler(request: any) {
  const response: any = {}
  if (!isMetamaskConnected()) {
    response.error = 'Metamask not connected'
    return JSON.stringify(response)
  }
  try {
    const { module, method, args } = request
    const res = await Web3.invokeWeb3Api(module, method, args)
    response.result = res
  } catch (e) {
    console.error(e)
    response.error = (e as any).message || e
  }
  return response
}

export const bgInit = () => {
  registerMessage({
    message: MessageTypes.Connect_Metamask,
    handleFunc: connectMessageHandler
  })
  registerMessage({
    message: MessageTypes.InvokeWeb3Api,
    handleFunc: invokeWeb3ApiMessageHandler
  })
}
