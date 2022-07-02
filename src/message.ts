const _messageHandlers = {}

export const getMessageHandler = (msg: string) => {
  return _messageHandlers[msg]
}

export type MessageHandler = {
  message: string
  handleFunc: any
}

export const registerMessage = function (messageHandler: MessageHandler) {
  console.debug('[util-message] registerMessage: ', messageHandler)
  _messageHandlers[messageHandler.message] = messageHandler.handleFunc
}

// message to background
export function randomId() {
  return Math.random().toString(36).substring(2, 10)
}

export const sendMessage = async (message: any) => {
  const id = randomId()
  message.id = id
  const msg = JSON.stringify(message)
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, function (response) {
      console.debug('[util-message] response from backend：' + response)
      try {
        const res = JSON.parse(response)
        if (res.id === id) {
          const r = res.error ? res : res.result
          resolve(r)
        }
      } catch (e) {
        reject(e)
      }
    })
  })
}
