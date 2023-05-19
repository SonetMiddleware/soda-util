import {
  randomId,
  MessageHandler,
  getMessageHandler,
  registerMessage,
  sendMessage
} from './message'
import {
  getUserAccount,
  getChainId,
  isMetamaskConnected,
  connectMetaMask,
  invokeWeb3Api,
  isMetamaskAccountConnected
} from './metamask'
import {
  createWeb3,
  requestAccounts as serviceRequestAccounts,
  logout
} from './service/metamask'
import {
  HttpRequestType,
  httpRequest,
  API_HOST,
  getChainName,
  getChainIdByName
} from './network'

export {
  randomId,
  MessageHandler,
  getMessageHandler,
  registerMessage,
  sendMessage,
  createWeb3,
  serviceRequestAccounts,
  logout,
  getUserAccount,
  getChainId,
  isMetamaskConnected,
  connectMetaMask,
  invokeWeb3Api,
  HttpRequestType,
  httpRequest,
  API_HOST,
  getChainName,
  getChainIdByName,
  isMetamaskAccountConnected
}
import { bgInit as metamaskBgInit } from './metamask'
import { bgInit as networkBgInit } from './network'
export const bgInit = () => {
  metamaskBgInit()
  networkBgInit()
}
