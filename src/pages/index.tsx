import { Heading, Button } from '@chakra-ui/react'
import { Head } from '../components/layout/Head'
// import Image from 'next/image'
import { LinkComponent } from '../components/layout/LinkComponent'
import { useState, useEffect } from 'react'
import { useFeeData, useSigner, useAccount, useBalance, useNetwork } from 'wagmi'
import { ethers } from 'ethers'
import { GCFA_CONTRACT_ADDRESS, GCFA_CONTRACT_ABI, EURM_CONTRACT_ADDRESS, EURM_CONTRACT_ABI } from '../lib/consts'
import useSound from 'use-sound' // https://www.joshwcomeau.com/react/announcing-use-sound-react-hook/
const stevie = 'https://bafybeicxvrehw23nzkwjcxvsytimqj2wos7dhh4evrv5kscbbj6agilcsy.ipfs.w3s.link/another-star.mp3'

export default function Home() {
  const [loadingMint, setLoadingMint] = useState<boolean>(false)
  const [loadingDeposit, setLoadingDeposit] = useState<boolean>(false)
  const [loadingWithdraw, setLoadingWithdraw] = useState<boolean>(false)
  const [loadingTransfer, setLoadingTransfer] = useState<boolean>(false)

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

  const [play, { stop, pause }] = useSound(stevie, {
    volume: 0.5,
  })

  const explorerUrl = network.chain?.blockExplorers?.default.url

  const cfa = new ethers.Contract(GCFA_CONTRACT_ADDRESS, GCFA_CONTRACT_ABI, signer)
  const eur = new ethers.Contract(EURM_CONTRACT_ADDRESS, EURM_CONTRACT_ABI, signer)

  useEffect(() => {
    const val = Number(bal?.formatted).toFixed(3)
    setUserBal(String(val) + ' ' + bal?.symbol)
  }, [bal?.formatted, bal?.symbol, address])

  const checkFees = () => {
    console.log('data?.formatted:', JSON.stringify(data?.formatted))
    return JSON.stringify(data?.formatted)
  }

  const mint = async () => {
    console.log('minting...')
    try {
      setLoadingMint(true)
      setTxLink('')
      const mint = await eur.mint(ethers.utils.parseEther('1'))
      const mintReceipt = await mint.wait(1)
      console.log('tx:', mintReceipt)
      setTxLink(explorerUrl + '/tx/' + mintReceipt.transactionHash)
      setLoadingMint(false)
      console.log('Minted. ✅')
      // play()
    } catch (e) {
      setLoadingMint(false)
      console.log('error:', e)
    }
  }

  const deposit = async () => {
    console.log('Depositing...')
    try {
      setTxLink('')
      setLoadingDeposit(true)
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
      // play()
    } catch (e) {
      setLoadingDeposit(false)
      console.log('error:', e)
    }
  }

  const withdraw = async () => {
    console.log('Withdrawing...')
    try {
      setTxLink('')
      setLoadingWithdraw(true)

      const withdraw = await cfa.withdrawTo(address, ethers.utils.parseEther('1000'))
      const withdrawReceipt = await withdraw.wait(1)
      console.log('tx:', withdrawReceipt)
      setTxLink(explorerUrl + '/tx/' + withdrawReceipt.transactionHash)

      setLoadingWithdraw(false)
      console.log('Withdrawn. ✅')
    } catch (e) {
      setLoadingWithdraw(false)
      console.log('error:', e)
    }
  }

  const transfer = async () => {
    console.log('Transfering...')
    try {
      setTxLink('')
      setLoadingTransfer(true)

      const withdraw = await cfa.transfer(address, ethers.utils.parseEther('500'))
      const withdrawReceipt = await withdraw.wait(1)
      console.log('tx:', withdrawReceipt)
      setTxLink(explorerUrl + '/tx/' + withdrawReceipt.transactionHash)

      setLoadingTransfer(false)
      console.log('500 units transferred. ✅')
    } catch (e) {
      setLoadingTransfer(false)
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
        {/* <Image height="800" width="800" alt="contract-image" src="/thistle-contract-feb-15-2023.png" /> */}
      </main>
    </>
  )
}
