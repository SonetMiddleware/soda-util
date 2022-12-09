import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import createMetaMaskProvider, {
  MetaMaskInpageProvider
} from '@dimensiondev/metamask-extension-provider'

let provider: MetaMaskInpageProvider | null = null
let web3: Web3 | null = null
let _accounts: string[] | null = null
let _chainId: number | null = null

async function onAccountsChanged(accounts: string[]) {
  console.debug('[util-metamask] onAccountsChanged: ', accounts)
  createProvider()
  _accounts = accounts
}

async function onChainIdChanged(id: string) {
  // learn more: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids and https://chainid.network/
  const chainId_ = Number.parseInt(id, 16)
  console.debug('[util-metamask] onChainIdChanged: ', chainId_)
  createProvider()
  _chainId = chainId_
  return chainId_
}

function onError(error: string) {
  console.error(error)
}

function createProvider() {
  if (provider) {
    provider.off('accountsChanged', onAccountsChanged)
    provider.off('chainChanged', onChainIdChanged)
    provider.off('error', onError)
  }
  provider = createMetaMaskProvider()

  if (!provider) throw new Error('Unable to create in page provider.')
  provider.on(
    'accountsChanged',
    onAccountsChanged as (...args: unknown[]) => void
  )
  provider.on('chainChanged', onChainIdChanged as (...args: unknown[]) => void)
  provider.on('error', onError as (...args: unknown[]) => void)
  return provider
}

function createHttpProvider(url: string) {
  const _provider = new Web3.providers.HttpProvider(url, {
    timeout: 5000, // ms
    // @ts-ignore
    clientConfig: {
      keepalive: true,
      keepaliveInterval: 1 // ms
    },
    reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: Number.MAX_SAFE_INTEGER,
      onTimeout: true
    }
  })
  return _provider
}

// MetaMask provider can be wrapped into web3 lib directly.
// https://github.com/MetaMask/extension-provider
export function createWeb3() {
  const provider_ = createProvider() as Provider
  // const provider_ = createHttpProvider('https://rpc-mumbai.maticvigil.com');
  if (!web3) web3 = new Web3(provider_)
  else web3.setProvider(provider_)
  return web3
}

export async function requestAccounts(targetChainId?: number) {
  let _web3: any = web3

  if (!_web3) {
    _web3 = createWeb3()
  }
  // if (!_accounts || !_chainId) web3 = createWeb3()

  if (!_accounts) {
    // update accounts
    const accounts = await _web3.eth.requestAccounts()
    await onAccountsChanged(accounts)
  }
  if (!_chainId) {
    // update chain id
    const chainId = await _web3.eth.getChainId()
    await onChainIdChanged(chainId.toString(16))
  }
  if (_chainId !== targetChainId && _web3) {
    try {
      await _web3.currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: Web3.utils.toHex(targetChainId) }]
      })
      _chainId = await _web3.eth.getChainId()
    } catch (switchError: any) {
      console.log('[switchError]: ', switchError)
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        alert('add this chain id')
      }
    }
    await onChainIdChanged(_chainId.toString(16))
  }

  return {
    chainId: _chainId,
    accounts: _accounts
  }
}

export async function logout() {}
