import axios from 'axios'
import { registerMessage, sendMessage } from './message'

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
    response.error = e
  }
  return response
}

export const bgInit = () => {
  registerMessage({
    message: MessageTypes.HTTP,
    handleFunc: httpRequestHandler
  })
}
