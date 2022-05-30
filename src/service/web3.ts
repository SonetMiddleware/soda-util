import { createWeb3 } from './metamask'

export const invokeWeb3Api = async (
  module: string,
  method: string,
  args?: any[]
) => {
  try {
    const web3: any = createWeb3()
    if (args && args.length > 0) {
      const res = await web3[module][method](...args)
      return res
    } else {
      const res = await web3[module][method]()
      return res
    }
  } catch (e) {
    console.error(e)
    return e
  }
}
