export function GetNetworkColor(chain?: string) {
  // console.log("chain:", chain)
  // if (chain === 'alfajores') return 'green'
  if (chain === 'Celo Mainnet') return 'green'
  // if (chain === 'gnosis') return 'blue'
  if (chain === 'chiado') return 'blue'

  return 'gray'
}
