import axios from 'axios'
import { registerMessage, sendMessage } from './message'
import { getChainId } from './metamask'

export const API_HOST = 'https://apiv2-test.platwin.io/api/v1'

export const getChainName = async (chainId?: number) => {
  let _chainId = chainId
  if (!chainId) {
    _chainId = await getChainId()
  }
  const map = {
    137: 'polygon',
    1: 'mainnet',
    80001: 'mumbai',
    4: 'rinkeby'
  }
  // fallback to mumbai
  return map[_chainId] || map[80001]
}

// message to background
const MessageTypes = {
  HTTP: 'HttpRequest'
}

export enum HttpRequestType {
  GET,
  POST
}

export const httpRequest = async (request: {
  url: string
  params?: any
  type?: HttpRequestType
}) => {
  try {
    const resp: any = await sendMessage({ type: MessageTypes.HTTP, request })
    return resp
  } catch (e) {
    console.error(e)
    return { error: e }
  }
}

async function httpRequestHandler(request: any) {
  const response: any = {}
  const { url, params, type } = request
  console.debug('[util-network] http request: ', url, params, type)
  try {
    let res: any
    if (type && type === HttpRequestType.POST) {
      res = await axios.post(url, params ? params : {})
    } else {
      res = await axios.get(url, params ? { params } : {})
    }
    if (res.data) return res.data
  } catch (e) {
    console.error(e)
    response.error = (e as any).message || e
  }
  return response
}

export const bgInit = () => {
  registerMessage({
    message: MessageTypes.HTTP,
    handleFunc: httpRequestHandler
  })
}
