import { Heading, Button, useToast, FormControl, FormLabel, FormHelperText, Input, Text } from '@chakra-ui/react'
import { Head } from '../../components/layout/Head'
import Image from 'next/image'
import { LinkComponent } from '../../components/layout/LinkComponent'
import { useState, useEffect } from 'react'
import { useFeeData, useSigner, useAccount, useBalance, useNetwork, useProvider } from 'wagmi'
import { ethers } from 'ethers'
import { GCFA_CONTRACT_ADDRESS, GCFA_CONTRACT_ABI, EURM_CONTRACT_ADDRESS, EURM_CONTRACT_ABI } from '../../lib/consts'
import useSound from 'use-sound' // https://www.joshwcomeau.com/react/announcing-use-sound-react-hook/
const stevie = 'https://bafybeicxvrehw23nzkwjcxvsytimqj2wos7dhh4evrv5kscbbj6agilcsy.ipfs.w3s.link/another-star.mp3'

export default function Nfts() {
  const { data: signer } = useSigner()

  const cfa = new ethers.Contract(GCFA_CONTRACT_ADDRESS, GCFA_CONTRACT_ABI, signer)
  const eur = new ethers.Contract(EURM_CONTRACT_ADDRESS, EURM_CONTRACT_ABI, signer)
  const { address, isConnecting, isDisconnected } = useAccount()

  const [loadingMint, setLoadingMint] = useState<boolean>(false)
  const [mintTxLink, setMintTxLink] = useState<string>('')
  const [loadingDeposit, setLoadingDeposit] = useState<boolean>(false)
  const [depositTxLink, setDepositTxLink] = useState<string>('')
  const [loadingWithdraw, setLoadingWithdraw] = useState<boolean>(false)
  const [withdrawTxLink, setWithdrawTxLink] = useState<string>('')
  const [loadingTransfer, setLoadingTransfer] = useState<boolean>(false)
  const [transferTxLink, setTransferTxLink] = useState<string>('')
  const [loadingFaucet, setLoadingFaucet] = useState<boolean>(false)
  const [faucetTxLink, setFaucetTxLink] = useState<string>('')
  const [cfaBal, setCfaBal] = useState<number>(0)
  const [eurBal, setEurBal] = useState<number>(0)
  const [eurAmount, setEurAmount] = useState<string>('1')
  const [depositAmount, setDepositAmount] = useState<string>('1')
  const [amountToWithdraw, setAmountToWithdraw] = useState<string>('1000')
  const [recipientAddress, setRecipientAddress] = useState<string>(address)
  const [transferAmount, setTransferAmount] = useState<string>('500')
  const [supply, setSupply] = useState<string>('?')

  const [userBal, setUserBal] = useState<string>('')

  const { data } = useFeeData()

  const {
    data: bal,
    isError,
    isLoading,
  } = useBalance({
    address: address,
  })
  const network = useNetwork()

  const provider = useProvider()

  // const [play, { stop, pause }] = useSound(stevie, {
  //   volume: 0.5,
  // })

  const explorerUrl = network.chain?.blockExplorers?.default.url

  const toast = useToast()

  useEffect(() => {
    const val = Number(bal?.formatted).toFixed(3)
    setUserBal(String(val) + ' ' + bal?.symbol)
  }, [bal?.formatted, bal?.symbol, address, provider])

  const checkFees = () => {
    console.log('data?.formatted:', JSON.stringify(data?.formatted))
    return JSON.stringify(data?.formatted)
  }

  const getBalances = async () => {
    const val = Number(bal?.formatted).toFixed(3)
    setUserBal(String(val) + ' ' + bal?.symbol)
    console.log('xDAI bal:', Number(bal?.formatted).toFixed(4))
    const x = await eur.balanceOf(address)
    setEurBal(Number(x / 10 ** 18))
    console.log('eur bal:', Number(x / 10 ** 18))
    const y = await cfa.balanceOf(address)
    setCfaBal(Number(y / 10 ** 18))
    console.log('cfa bal:', Number(y / 10 ** 18))
    getSupply()
  }

  const getSupply = async () => {
    const supplyRaw = await cfa.totalSupply()
    console.log('supplyRaw', supplyRaw)
    const supply = ethers.utils.formatEther(supplyRaw)
    setSupply(supply)
    console.log('setSupply', supply)
    return supply
  }

  const mint = async () => {
    console.log('minting...')
    try {
      setLoadingMint(true)
      setMintTxLink('')

      // const xdaiBal = Number(bal.formatted)
      // console.log('xdaiBal', xdaiBal)
      // if (xdaiBal < 0.000001) {
      //   toast({
      //     title: 'Need xDAI',
      //     description: "You don't have enough xDAI to cover the gas costs for that mint. Please click on the 'Get free xDAI' button.",
      //     status: 'error',
      //     variant: 'subtle',
      //     duration: 20000,
      //     position: 'top',
      //     isClosable: true,
      //   })
      //   setLoadingMint(false)
      //   return
      // }

      const mint = await eur.mint(ethers.utils.parseEther(eurAmount))
      const mintReceipt = await mint.wait(1)
      console.log('tx:', mintReceipt)
      setMintTxLink(explorerUrl + '/tx/' + mintReceipt.transactionHash)
      setLoadingMint(false)
      console.log('Minted. ✅')
      toast({
        title: 'Successful mint',
        position: 'top',
        description: "You've just minted new euros! You can go ahead and click on 'Deposit'",
        status: 'success',
        variant: 'subtle',
        duration: 20000,
        isClosable: true,
      })
      // play()
      getBalances()
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
      setDepositTxLink('')
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
      const approveTx = await eur.approve(cfa.address, ethers.utils.parseEther(depositAmount))
      const approveReceipt = await approveTx.wait(1)
      console.log('tx:', approveReceipt)

      console.log('GCFA_CONTRACT_ADDRESS:', GCFA_CONTRACT_ADDRESS)
      console.log('GCFA_CONTRACT_ABI:', GCFA_CONTRACT_ABI)
      console.log('cfa.address:', cfa.address)

      const check = await cfa.name()
      console.log('check:', check)

      const check2 = await eur.balanceOf(address)
      console.log('check2 (EUR bal):', check2 / 10 ** 18)

      const deposit = await cfa.depositFor(address, ethers.utils.parseEther(depositAmount))
      const depositReceipt = await deposit.wait(1)
      console.log('tx:', depositReceipt)
      setDepositTxLink(explorerUrl + '/tx/' + depositReceipt.transactionHash)

      const check3 = await cfa.balanceOf(address)
      console.log('check3 (CFA bal):', check3 / 10 ** 18)

      const check4 = await eur.balanceOf(address)
      console.log('check4 (EUR bal):', check4 / 10 ** 18)

      setLoadingDeposit(false)
      console.log('Deposited. ✅')
      toast({
        title: 'Successful deposit',
        description: "You've just deposited EUR. You have more gCFA now! 🎉",
        status: 'success',
        position: 'top',
        variant: 'subtle',
        duration: 20000,
        isClosable: true,
      })
      getBalances()
      // play()
    } catch (e) {
      setLoadingDeposit(false)
      console.log('error:', e)
      toast({
        title: '',
        description: 'There was an error, worry about that. (' + e.message + ')',
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
      setWithdrawTxLink('')
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

      const withdraw = await cfa.withdrawTo(address, ethers.utils.parseEther(amountToWithdraw))
      const withdrawReceipt = await withdraw.wait(1)
      console.log('tx:', withdrawReceipt)
      setWithdrawTxLink(explorerUrl + '/tx/' + withdrawReceipt.transactionHash)

      setLoadingWithdraw(false)
      console.log('Withdrawn. ✅')
      toast({
        title: 'Successful withdrawal',
        description: "You just withdrawn gCFA. You've got some EUR in your pocket",
        status: 'success',
        position: 'top',
        variant: 'subtle',
        duration: 20000,
        isClosable: true,
      })
      getBalances()
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
      setTransferTxLink('')
      setLoadingTransfer(true)

      // const cfaBal = await cfa.balanceOf(address)
      // if (cfaBal == 0) {
      //   toast({
      //     title: '',
      //     description: "You don't have any gCFA on your wallet yet. Please deposit first.",
      //     status: 'error',
      //     position: 'top',
      //     variant: 'subtle',
      //     duration: 20000,
      //     isClosable: true,
      //   })

      //   setLoadingTransfer(false)
      //   return
      // }

      const withdraw = await cfa.transfer(recipientAddress, ethers.utils.parseEther(transferAmount))
      const withdrawReceipt = await withdraw.wait(1)
      console.log('tx:', withdrawReceipt)
      setTransferTxLink(explorerUrl + '/tx/' + withdrawReceipt.transactionHash)

      setLoadingTransfer(false)
      console.log(transferAmount + 'units transferred. ✅')
      console.log('transferAmount', transferAmount)
      toast({
        title: 'Successful transfer',
        description: "You've just transferred some gCFA! Congrats and thank you.",
        status: 'success',
        variant: 'subtle',
        position: 'top',
        duration: 20000,
        isClosable: true,
      })
      getBalances()
    } catch (e) {
      setLoadingTransfer(false)
      console.log('error:', e)
      const cfaBal = await cfa.balanceOf(address)

      if (cfaBal < transferAmount) {
        toast({
          title: '',
          description: 'You dont have enough gCFA on your wallet yet. Please deposit some EUR.',
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
      setFaucetTxLink('')
      setLoadingFaucet(true)

      console.log('bal:', bal)
      console.log('bal.formatted:', Number(bal.formatted))
      const xdaiBal = Number(bal.formatted)
      if (xdaiBal >= 0.001) {
        toast({
          title: 'You already have enough xDAI',
          description: "You're good to go: you can click on 'Mint EUR'.",
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
      setFaucetTxLink(explorerUrl + '/tx/' + txReceipt.transactionHash)

      const x = await eur.balanceOf(address)
      console.log('x:', Number(x / 10 ** 18))

      setLoadingFaucet(false)
      console.log('Done. You got 0.001 xDAI on Chiado ✅')
      getBalances()
      toast({
        title: 'Successful transfer',
        description: 'You got 0.001 xDAI on Chiado Testnet ✅',
        status: 'success',
        variant: 'subtle',
        position: 'top',
        duration: 20000,
        isClosable: true,
      })
    } catch (e) {
      setLoadingFaucet(false)
      console.log('error:', e)
    }
  }

  return (
    <>
      <Head />

      <main>
        <Heading as="h1" size="md">
          Create an &apos;NFT bank note&apos; with Minifolio (?)
        </Heading>
        <p></p>
        <br />
        <p>
          If you want to this built,{' '}
          <LinkComponent target="blank" href={mintTxLink}>
            join the fun on Github!
          </LinkComponent>
          {/* <Image priority height="30" width="30" alt="gcfa-banknote" src="./gcfa-banknote.png" /> */}
        </p>
        <br />
        <Text fontSize="12px" color="#45a2f8">
          <LinkComponent target="blank" href={'https://github.com/w3hc/gcfa-ui/issues'}>
            If you want to this built, join the fun on Github!
          </LinkComponent>
        </Text>
      </main>
    </>
  )
}
