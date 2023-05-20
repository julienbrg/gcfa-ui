import { Heading, Button, useToast } from '@chakra-ui/react'
import { Head } from '../components/layout/Head'
import Image from 'next/image'
import { LinkComponent } from '../components/layout/LinkComponent'
import { useState, useEffect } from 'react'
import { useFeeData, useSigner, useAccount, useBalance, useNetwork, useProvider } from 'wagmi'
import { ethers } from 'ethers'
import { GCFA_CONTRACT_ADDRESS, GCFA_CONTRACT_ABI, EURM_CONTRACT_ADDRESS, EURM_CONTRACT_ABI } from '../lib/consts'
import useSound from 'use-sound' // https://www.joshwcomeau.com/react/announcing-use-sound-react-hook/
const stevie = 'https://bafybeicxvrehw23nzkwjcxvsytimqj2wos7dhh4evrv5kscbbj6agilcsy.ipfs.w3s.link/another-star.mp3'

export default function Home() {
  const [loadingMint, setLoadingMint] = useState<boolean>(false)
  const [loadingDeposit, setLoadingDeposit] = useState<boolean>(false)
  const [loadingWithdraw, setLoadingWithdraw] = useState<boolean>(false)
  const [loadingTransfer, setLoadingTransfer] = useState<boolean>(false)
  const [loadingFaucet, setLoadingFaucet] = useState<boolean>(false)

  const [userBal, setUserBal] = useState<string>('')
  const [txLink, setTxLink] = useState<string>('')

  const { data } = useFeeData()
  const { address, isConnecting, isDisconnected } = useAccount()

  const { data: signer } = useSigner()

  const {
    data: bal,
    isError,
    isLoading,
  } = useBalance({
    address: address,
  })
  const network = useNetwork()

  const provider = useProvider()

  const [play, { stop, pause }] = useSound(stevie, {
    volume: 0.5,
  })

  const explorerUrl = network.chain?.blockExplorers?.default.url

  const cfa = new ethers.Contract(GCFA_CONTRACT_ADDRESS, GCFA_CONTRACT_ABI, signer)
  const eur = new ethers.Contract(EURM_CONTRACT_ADDRESS, EURM_CONTRACT_ABI, signer)

  const toast = useToast()
  const variants = ['solid', 'subtle', 'left-accent', 'top-accent']

  useEffect(() => {
    const val = Number(bal?.formatted).toFixed(3)
    setUserBal(String(val) + ' ' + bal?.symbol)
  }, [bal?.formatted, bal?.symbol, address, provider])

  const checkFees = () => {
    console.log('data?.formatted:', JSON.stringify(data?.formatted))
    return JSON.stringify(data?.formatted)
  }

  const mint = async () => {
    console.log('minting...')
    try {
      setLoadingMint(true)
      setTxLink('')

      const xdaiBal = Number(bal.formatted)
      console.log('xdaiBal', xdaiBal)
      if (xdaiBal < 0.001) {
        toast({
          title: 'Need xDAI',
          description: "You don't have enough xDAI to cover the gas costs for that mint. Please click on the 'Chiado xDAI faucet' button.",
          status: 'error',
          variant: 'subtle',
          duration: 20000,
          position: 'top',
          isClosable: true,
        })
        setLoadingMint(false)
        return
      }

      const mint = await eur.mint(ethers.utils.parseEther('1'))
      const mintReceipt = await mint.wait(1)
      console.log('tx:', mintReceipt)
      setTxLink(explorerUrl + '/tx/' + mintReceipt.transactionHash)
      setLoadingMint(false)
      console.log('Minted. ✅')
      toast({
        title: 'Successful mint',
        position: 'top',
        description: "You've just minted 1 EUR. You can go ahead and click on 'Deposit'",
        status: 'success',
        variant: 'subtle',
        duration: 20000,
        isClosable: true,
      })
      // play()
    } catch (e) {
      setLoadingMint(false)
      console.log('error:', e)
      toast({
        title: 'Minting error',
        description: "Your mint transaction didn't go through. We're sorry about that (" + e.message + ')',
        status: 'error',
        position: 'top',
        variant: 'subtle',
        duration: 20000,
        isClosable: true,
      })
    }
  }

  const deposit = async () => {
    console.log('Depositing...')
    try {
      setTxLink('')
      setLoadingDeposit(true)

      const xdaiBal = Number(bal.formatted)
      const eurBal = await eur.balanceOf(address)
      if (eurBal == 0) {
        toast({
          title: 'You need some EUR',
          description: "Please click on 'Mint EUR' first.",
          status: 'error',
          position: 'top',
          variant: 'subtle',
          duration: 20000,
          isClosable: true,
        })

        setLoadingDeposit(false)
        return
      }
      const approveTx = await eur.approve(cfa.address, ethers.utils.parseEther('1'))
      const approveReceipt = await approveTx.wait(1)
      console.log('tx:', approveReceipt)

      console.log('GCFA_CONTRACT_ADDRESS:', GCFA_CONTRACT_ADDRESS)
      console.log('GCFA_CONTRACT_ABI:', GCFA_CONTRACT_ABI)
      console.log('cfa.address:', cfa.address)

      const check = await cfa.name()
      console.log('check:', check)

      const check2 = await eur.balanceOf(address)
      console.log('check2 (EUR bal):', check2 / 10 ** 18)

      const deposit = await cfa.depositFor(address, ethers.utils.parseEther('1'))
      const depositReceipt = await deposit.wait(1)
      console.log('tx:', depositReceipt)
      setTxLink(explorerUrl + '/tx/' + depositReceipt.transactionHash)

      const check3 = await cfa.balanceOf(address)
      console.log('check3 (CFA bal):', check3 / 10 ** 18)

      const check4 = await eur.balanceOf(address)
      console.log('check4 (EUR bal):', check4 / 10 ** 18)

      setLoadingDeposit(false)
      console.log('Deposited. ✅')
      toast({
        title: 'Successful deposit',
        description: "You've just deposited 1 EUR and got 655.957 gCFA",
        status: 'success',
        position: 'top',
        variant: 'subtle',
        duration: 20000,
        isClosable: true,
      })
      // play()
    } catch (e) {
      setLoadingDeposit(false)
      console.log('error:', e)
      toast({
        title: '',
        description: "You don't have enough EUR on your wallet. Please mint some EUR. (" + e.message + ')',
        status: 'error',
        position: 'top',
        variant: 'subtle',
        duration: 20000,
        isClosable: true,
      })
    }
  }

  const withdraw = async () => {
    console.log('Withdrawing...')
    try {
      setTxLink('')
      setLoadingWithdraw(true)

      const cfaBal = await cfa.balanceOf(address)
      if (cfaBal == 0) {
        toast({
          title: '',
          description: "You don't have any gCFA on your wallet yet. Please deposit first.",
          status: 'error',
          position: 'top',
          variant: 'subtle',
          duration: 20000,
          isClosable: true,
        })

        setLoadingWithdraw(false)
        return
      }

      const withdraw = await cfa.withdrawTo(address, ethers.utils.parseEther('1000'))
      const withdrawReceipt = await withdraw.wait(1)
      console.log('tx:', withdrawReceipt)
      setTxLink(explorerUrl + '/tx/' + withdrawReceipt.transactionHash)

      setLoadingWithdraw(false)
      console.log('Withdrawn. ✅')
      toast({
        title: 'Successful withdrawal',
        description: "You've just withdrawn 1000 gCFA: that's 1.53 €",
        status: 'success',
        position: 'top',
        variant: 'subtle',
        duration: 20000,
        isClosable: true,
      })
    } catch (e) {
      setLoadingWithdraw(false)
      console.log('error:', e)
      const cfaBal = await cfa.balanceOf(address)

      toast({
        title: '',
        description: "You don't have enough gCFA on your wallet yet. Please deposit some EUR. (" + e.message + ')',
        status: 'error',
        position: 'top',
        variant: 'subtle',
        duration: 20000,
        isClosable: true,
      })
    }
  }

  const transfer = async () => {
    console.log('Transfering...')
    try {
      setTxLink('')
      setLoadingTransfer(true)

      const cfaBal = await cfa.balanceOf(address)
      if (cfaBal == 0) {
        toast({
          title: '',
          description: "You don't have any gCFA on your wallet yet. Please deposit first.",
          status: 'error',
          position: 'top',
          variant: 'subtle',
          duration: 20000,
          isClosable: true,
        })

        setLoadingTransfer(false)
        return
      }

      const withdraw = await cfa.transfer(address, ethers.utils.parseEther('500'))
      const withdrawReceipt = await withdraw.wait(1)
      console.log('tx:', withdrawReceipt)
      setTxLink(explorerUrl + '/tx/' + withdrawReceipt.transactionHash)

      setLoadingTransfer(false)
      console.log('500 units transferred. ✅')
      toast({
        title: 'Successful transfer',
        description: "You've just transferred 500 gCFA to yourself!.",
        status: 'success',
        variant: 'subtle',
        position: 'top',
        duration: 20000,
        isClosable: true,
      })
    } catch (e) {
      setLoadingTransfer(false)
      console.log('error:', e)
      const cfaBal = await cfa.balanceOf(address)

      if (cfaBal < 500) {
        toast({
          title: '',
          description: "You don't have enough gCFA on your wallet yet. Please deposit some EUR." + e,
          status: 'error',
          position: 'top',
          variant: 'subtle',
          duration: 20000,
          isClosable: true,
        })

        setLoadingTransfer(false)
        return
      }
    }
  }

  const getFreeMoney = async () => {
    console.log('Getting free money...')
    try {
      setTxLink('')
      setLoadingFaucet(true)
      console.log('bal:', bal)
      console.log('bal.formatted:', bal.formatted)
      const xdaiBal = Number(bal.formatted)
      if (xdaiBal > 0.001) {
        toast({
          title: 'You already have enough xDAI',
          description: "You're ready: you can go ahead and click on 'Mint EUR'.",
          status: 'success',
          variant: 'subtle',
          duration: 20000,
          position: 'top',
          isClosable: true,
        })
        setLoadingFaucet(false)
        return
      }

      const pKey = process.env.NEXT_PUBLIC_CHIADO_PRIVATE_KEY // 0x3E536E5d7cB97743B15DC9543ce9C16C0E3aE10F
      const specialSigner = new ethers.Wallet(pKey, provider)

      const tx = await specialSigner.sendTransaction({
        to: address,
        value: ethers.utils.parseEther('0.001'),
      })
      const txReceipt = await tx.wait(1)
      console.log('tx:', txReceipt)
      setTxLink(explorerUrl + '/tx/' + txReceipt.transactionHash)

      setLoadingFaucet(false)
      console.log('Done. You got 0.001 xDAI on Chiado ✅')
    } catch (e) {
      setLoadingFaucet(false)
      console.log('error:', e)
    }
  }

  return (
    <>
      <Head />

      <main>
        <Heading as="h2">gCFA App</Heading>
        <br />
        <p>Welcome to gCFA App!</p>

        {isDisconnected ? (
          <>
            <br />
            <p>Please connect your wallet.</p>
          </>
        ) : (
          <>
            <br />

            <p>
              You can deposit your EURe to get the equivalent in gCFA, you can withdraw your gCFA and get your EURe back, and you also can do a simple
              transfer.
            </p>
            <br />
            <p>
              You&apos;re connected to <strong>{network.chain?.name}</strong> and your wallet currently holds
              <strong> {userBal}</strong>. You can go ahead and click on the &apos;Deposit&apos; button below: you will be invited to sign 2
              transactions.{' '}
            </p>
          </>
        )}

        <br />

        {!loadingFaucet ? (
          <Button mr={3} mb={3} colorScheme="green" variant="outline" onClick={getFreeMoney}>
            Chiado xDAI faucet
          </Button>
        ) : (
          <Button mr={3} mb={3} isLoading colorScheme="green" loadingText="Cashing in" variant="outline">
            Cashing in
          </Button>
        )}

        {!loadingMint ? (
          <Button mr={3} mb={3} colorScheme="green" variant="outline" onClick={mint}>
            Mint EUR
          </Button>
        ) : (
          <Button mr={3} mb={3} isLoading colorScheme="green" loadingText="Minting" variant="outline">
            Minting
          </Button>
        )}

        {!loadingDeposit ? (
          <Button mr={3} mb={3} colorScheme="green" variant="outline" onClick={deposit}>
            Deposit
          </Button>
        ) : (
          <Button mr={3} mb={3} isLoading colorScheme="green" loadingText="Depositing" variant="outline">
            Depositing
          </Button>
        )}

        {!loadingWithdraw ? (
          <Button mr={3} mb={3} colorScheme="green" variant="outline" onClick={withdraw}>
            Withdraw
          </Button>
        ) : (
          <Button mr={3} mb={3} isLoading colorScheme="green" loadingText="Withdrawing" variant="outline">
            Withdrawing
          </Button>
        )}

        {!loadingTransfer ? (
          <Button mr={3} mb={3} colorScheme="green" variant="outline" onClick={transfer}>
            Transfer
          </Button>
        ) : (
          <Button mr={3} mb={3} isLoading colorScheme="green" loadingText="Transferring" variant="outline">
            Transferring
          </Button>
        )}

        {txLink && (
          <>
            <br />
            <br />
            <p>Done! You can view your transaction on Etherscan:</p>
            <br />
            <LinkComponent target="blank" href={txLink}>
              {txLink}
            </LinkComponent>
          </>
        )}
        <br />
        <br />
        {/* {txLink && (
          <Button colorScheme="red" variant="outline" onClick={() => stop()}>
            Stop the music
          </Button>
        )} */}
        <Image
          priority
          height="800"
          width="1000"
          alt="contract-image"
          src="https://bafybeidfcsm7moglsy4sng57jdwmnc4nw3p5tjheqm6vxk3ty65owrfyk4.ipfs.w3s.link/gcfa-code.png"
        />
      </main>
    </>
  )
}
