import axios from 'axios'
import { registerMessage, sendMessage } from './message'
import { getChainId } from './metamask'
import fetchAdapter from '@vespaiach/axios-fetch-adapter'

export const API_HOST =
  process.env.NODE_ENV === 'development'
    ? 'https://apiv2-test.platwin.io/api/v1'
    : 'https://apiv2.platwin.io/api/v1'
// export const API_HOST = 'https://apiv2-test.platwin.io/api/v1' //FIXME:test only

console.log('NODE_ENV: ', process.env.NODE_ENV, API_HOST)

const Chain_Map = {
  137: 'polygon',
  1: 'mainnet',
  80001: 'mumbai',
  4: 'rinkeby',
  flowmain: 'flowmain',
  flowtest: 'flowtest'
}
export const getChainName = async (chainId?: number) => {
  let _chainId = chainId
  if (!chainId) {
    _chainId = await getChainId()
  }

  // fallback to mumbai
  return Chain_Map[_chainId] || Chain_Map[80001]
}

export const getChainIdByName = (chain_name: string) => {
  for (let key of Object.keys(Chain_Map)) {
    if (Chain_Map[key] === chain_name) {
      return key
    }
  }
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
  const axiosInstance = axios.create({
    adapter: fetchAdapter
  })
  console.debug('[util-network] http request: ', url, params, type)
  try {
    let res: any
    if (type && type === HttpRequestType.POST) {
      res = await axiosInstance.post(url, params ? params : {})
    } else {
      res = await axiosInstance.get(url, params ? { params } : {})
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
