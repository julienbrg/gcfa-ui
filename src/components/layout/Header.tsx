import React from 'react'
import { Flex, useColorModeValue, Spacer, Heading, Text } from '@chakra-ui/react'
import { SITE_NAME } from '../../utils/config'
import { LinkComponent } from './LinkComponent'
import { ThemeSwitcher } from './ThemeSwitcher'
import { ConnectKitButton } from 'connectkit'
import Image from 'next/image'

interface Props {
  className?: string
}

export function Header(props: Props) {
  const className = props.className ?? ''

  return (
    <Flex as="header" className={className} bg={useColorModeValue('gray.100', 'gray.900')} px={4} py={5} mb={8} alignItems="center">
      <LinkComponent href="/">
        <Heading as="h1" size="md">
          {SITE_NAME}
        </Heading>
      </LinkComponent>

      <Spacer />

      <Flex alignItems="center" gap={4}>
        <LinkComponent href="./dex">
          <Heading as="h2" size="s">
            DEX
          </Heading>
        </LinkComponent>
        <LinkComponent href="./nfts">
          <Heading as="h2" size="s">
            NFTs
          </Heading>
        </LinkComponent>
        <LinkComponent href="./dao">
          <Heading as="h2" size="s">
            DAO
          </Heading>
        </LinkComponent>
        <Image priority height="30" width="30" alt="contract-image" src="./gnosis-owl.png" />
        <ConnectKitButton />
        <ThemeSwitcher />
      </Flex>
    </Flex>
  )
}
