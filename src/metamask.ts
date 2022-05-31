import { sendMessage, registerMessage } from './message'
import * as MetaMask from './service/metamask'
import * as Web3 from './service/web3'
import { first } from 'lodash-es'

// message to background
const MessageTypes = {
  Connect_Metamask: 'Connect_Metamask',
  InvokeWeb3Api: 'InvokeWeb3Api'
}

let accountGlobal = ''
export const getUserAccount = async (global?: boolean) => {
  if (global && accountGlobal) return accountGlobal
  const res: any = await sendMessage({ type: MessageTypes.Connect_Metamask })
  console.debug('[util-metamask] getUserAccount: ', res)
  if (res.error) {
    accountGlobal = ''
  } else {
    const { account } = res.result
    accountGlobal = account
  }
  return accountGlobal
}
export const getChainId = async () => {
  try {
    const res: any = await sendMessage({ type: MessageTypes.Connect_Metamask })
    console.debug('[util-metamask] getChainId: ', res)
    const { chainId } = res.result
    return chainId
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

let cachedWallet = null
export const connectMetaMask = async () => {
  try {
    const { accounts, chainId } = await MetaMask.requestAccounts()
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
    const res = await connectMetaMask()
    response.result = res
  } catch (e) {
    console.error(e)
    response.error = e
  }
  return response
}

export const invokeWeb3Api = async (request: any) => {
  const response: any = {}
  try {
    const res: any = await sendMessage({
      type: MessageTypes.InvokeWeb3Api,
      request
    })
    return res
  } catch (e) {
    console.error(e)
    response.error = e
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
    response.error = e
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
