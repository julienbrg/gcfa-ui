export function GetNetworkColor(chain?: string) {
  if (chain === 'Celo Alfajores Testnet') return 'green'
  if (chain === 'Celo Mainnet') return 'green'
  return 'gray'
}
