import { ThemingProps } from '@chakra-ui/react'
import { Chain } from '@wagmi/chains'

export const SITE_NAME = 'Good CFA'
export const SITE_DESCRIPTION = 'Deposit, withdraw or transfer gCFA.'
export const SITE_URL = 'https://w3hc.org'
export const THEME_INITIAL_COLOR = 'dark'
export const THEME_COLOR_SCHEME: ThemingProps['colorScheme'] = 'gray'
export const THEME_CONFIG = {
  initialColorMode: THEME_INITIAL_COLOR,
}

export const SOCIAL_TWITTER = 'W3HC'
export const SOCIAL_GITHUB = 'w3hc/nexth'

const celo: Chain = {
  id: 42220,
  name: 'Celo Mainnet',
  network: 'Celo Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://forno.celo.org'],
    },
    public: {
      http: ['https://forno.celo.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Celoscan', url: 'https://celoscan.io/' },
  },
  testnet: false,
}

const alfajores: Chain = {
  id: 44787,
  name: 'Celo Alfajores Testnet',
  network: 'Celo Alfajores Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://celo-alfajores.infura.io/v3/2cd8708d4b6546ba8ab1dceacc3c1447'],
    },
    public: {
      http: ['https://celo-alfajores.infura.io/v3/2cd8708d4b6546ba8ab1dceacc3c1447'],
    },
  },
  blockExplorers: {
    default: { name: 'Celoscan', url: 'https://alfajores.celoscan.io/' },
  },
  testnet: true,
}

export const ETH_CHAINS = [celo, alfajores]
export const alchemyId = process.env.NEXT_PUBLIC_ARBITRUM_ALCHEMY_ID

export const SERVER_SESSION_SETTINGS = {
  cookieName: SITE_NAME,
  password: process.env.SESSION_PASSWORD ?? 'UPDATE_TO_complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}
