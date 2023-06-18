import {
  Heading,
  Button,
  useToast,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Text,
} from "@chakra-ui/react";
import { Head } from "../components/layout/Head";
import { WarningTwoIcon, CheckIcon, ArrowForwardIcon } from "@chakra-ui/icons";

// import Image from 'next/image'
import { LinkComponent } from "../components/layout/LinkComponent";
import { useState, useEffect } from "react";
import {
  useFeeData,
  useSigner,
  useAccount,
  useBalance,
  useNetwork,
  useProvider,
} from "wagmi";
import { ethers } from "ethers";
import {
  GCFA_CONTRACT_ADDRESS,
  GCFA_CONTRACT_ABI,
  EURM_CONTRACT_ADDRESS,
  EURM_CONTRACT_ABI,
  GCFA_MAINNET_CONTRACT_ADDRESS,
  CEUR_CONTRACT_ADDRESS,
} from "../lib/consts";

export default function Home() {
  const { data: signer } = useSigner();
  const network = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const provider = useProvider();

  let cfa;
  let eur;
  useEffect(() => {
    if (network?.chain?.testnet === false) {
      cfa = new ethers.Contract(
        GCFA_MAINNET_CONTRACT_ADDRESS,
        GCFA_CONTRACT_ABI,
        signer
      );
      eur = new ethers.Contract(
        CEUR_CONTRACT_ADDRESS,
        EURM_CONTRACT_ABI,
        signer
      );
    } else {
      cfa = new ethers.Contract(
        GCFA_CONTRACT_ADDRESS,
        GCFA_CONTRACT_ABI,
        signer
      );
      eur = new ethers.Contract(
        EURM_CONTRACT_ADDRESS,
        EURM_CONTRACT_ABI,
        signer
      );
    }
  }, [address, network]);

  const [loadingMint, setLoadingMint] = useState<boolean>(false);
  const [mintTxLink, setMintTxLink] = useState<string>("");
  const [loadingDeposit, setLoadingDeposit] = useState<boolean>(false);
  const [depositTxLink, setDepositTxLink] = useState<string>("");
  const [loadingWithdraw, setLoadingWithdraw] = useState<boolean>(false);
  const [withdrawTxLink, setWithdrawTxLink] = useState<string>("");
  const [loadingTransfer, setLoadingTransfer] = useState<boolean>(false);
  const [transferTxLink, setTransferTxLink] = useState<string>("");
  const [loadingFaucet, setLoadingFaucet] = useState<boolean>(false);
  const [faucetTxLink, setFaucetTxLink] = useState<string>("");
  const [userBal, setUserBal] = useState<number>(0);
  const [eurBal, setEurBal] = useState<number>(0);
  const [cfaBal, setCfaBal] = useState<number>(0);
  const [eurAmount, setEurAmount] = useState<string>("1");
  const [depositAmount, setDepositAmount] = useState<string>("1");
  const [amountToWithdraw, setAmountToWithdraw] = useState<string>("1000");
  const [recipientAddress, setRecipientAddress] = useState<string>(address);
  const [transferAmount, setTransferAmount] = useState<string>("500");
  const [supply, setSupply] = useState<number>(0);
  const [isWitelisted, setIsWitelisted] = useState<boolean>(false);

  const { data } = useFeeData();

  const {
    data: bal,
    isError,
    isLoading,
  } = useBalance({
    address: address,
  });

  const explorerUrl = network.chain?.blockExplorers?.default.url;

  const toast = useToast();

  useEffect(() => {
    if (!isDisconnected) {
      getUserBal();
      getEurBal();
      getCfaBal();
      getSupply();
    }
  }, [address, provider, network]);
  
  const addTokenToMetaMask = async () => {
    if (network?.chain?.testnet === false) {
      toast({
        title: "Contract not deployed yet",
        description:
          "The gCFA contract is not available on Celo Mainnet yet so you can't add it to MetaMask.",
        status: "error",
        position: "top",
        variant: "subtle",
        duration: 20000,
        isClosable: true,
      });
      return;
    }
    try {
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address:
              network?.chain?.testnet === true
                ? GCFA_CONTRACT_ADDRESS
                : GCFA_MAINNET_CONTRACT_ADDRESS,
            symbol: "gCFA",
            decimals: 18,
            image:
              "https://bafybeia3gyu6k3hfutyw2blt55i22ywhhbidhkib5yq3zje4r3hzeewvpy.ipfs.w3s.link/green-gold-yellow-red-africa-flag-mens-tall-t-shirt.jpg",
          },
        },
      });

      if (wasAdded) {
        console.log("gCFA Added to MetaMask!");
      } else {
        console.log(
          "There was an error, we couldn't add the gCFA token to MetaMask"
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUserBal = async () => {
    const val = Number(bal?.formatted)
    console.log("val:", val)
    setUserBal(val)
    console.log('CELO bal:', Number(bal?.formatted))
    return Number(bal?.formatted)
    // return Number(0);
  };

  const getEurBal = async () => {
    let eur;
    if (network?.chain?.testnet === false || network?.chain?.testnet !== undefined) {
      eur = new ethers.Contract(
        CEUR_CONTRACT_ADDRESS,
        EURM_CONTRACT_ABI,
        provider
      );
    } else {
      eur = new ethers.Contract(
        EURM_CONTRACT_ADDRESS,
        EURM_CONTRACT_ABI,
        provider
      );
    }
    const x = await eur.balanceOf(address);
    setEurBal(Number(x / 10 ** 18));
    console.log("eur bal:", Number(x / 10 ** 18));
    return Number(x / 10 ** 18);
  };

  const getCfaBal = async () => {
    let cfa;
    console.log("network?.chain?.testnet:", network?.chain?.testnet)
    if (network?.chain?.testnet === false || network?.chain?.testnet !== undefined) {
      // cfa = new ethers.Contract(GCFA_MAINNET_CONTRACT_ADDRESS, GCFA_CONTRACT_ABI, provider)
      // const y = await cfa.balanceOf(address)
      // setCfaBal(Number(y / 10 ** 18))
      setCfaBal(Number(0));
      // console.log('cfa bal:', Number(y / 10 ** 18))
      // return Number(y / 10 ** 18)
      return Number(0);
    } else {
      cfa = new ethers.Contract(
        GCFA_CONTRACT_ADDRESS,
        GCFA_CONTRACT_ABI,
        provider
      );
      const y = await cfa.balanceOf(address);
      setCfaBal(Number(y / 10 ** 18));
      console.log("[getCfaBal] cfa bal:", Number(y / 10 ** 18));
      return Number(y / 10 ** 18);
    }
  };

  const getSupply = async () => {
    let cfa;
    if (network?.chain?.testnet === false || network?.chain?.testnet !== undefined) {
      // cfa = new ethers.Contract(GCFA_MAINNET_CONTRACT_ADDRESS, GCFA_CONTRACT_ABI, provider)
      // const supplyRaw = await cfa.totalSupply()
      // console.log('supplyRaw', supplyRaw)
      // const supply = ethers.utils.formatEther(supplyRaw)
      // setSupply(supply)
      setSupply(0);
      // console.log('setSupply', supply)
      // return supply
      return Number(0);
    } else {
      cfa = new ethers.Contract(
        GCFA_CONTRACT_ADDRESS,
        GCFA_CONTRACT_ABI,
        provider
      );
      const supplyRaw = await cfa.totalSupply();
      console.log("supplyRaw", supplyRaw);
      const supply = ethers.utils.formatEther(supplyRaw);
      setSupply(Number(supply));
      console.log("setSupply", supply);
      return supply;
    }
  };

  const mint = async () => {
    console.log("minting...");
    if (network?.chain?.testnet === false) {
      toast({
        title: "Contract not deployed yet",
        description: "The gCFA contract is not available on Celo Mainnet yet.",
        status: "error",
        position: "top",
        variant: "subtle",
        duration: 20000,
        isClosable: true,
      });
      return;
    }
    try {
      setLoadingMint(true);
      setMintTxLink("");
      const mint = await eur.mint(ethers.utils.parseEther(eurAmount));
      const mintReceipt = await mint.wait(1);
      console.log("tx:", mintReceipt);
      setMintTxLink(explorerUrl + "/tx/" + mintReceipt.transactionHash);
      setLoadingMint(false);
      console.log("Minted. ✅");
      toast({
        title: "Successful mint",
        position: "top",
        description:
          "You've just minted new euros! You can go ahead and click on 'Deposit'",
        status: "success",
        variant: "subtle",
        duration: 20000,
        isClosable: true,
      });
      getEurBal();
    } catch (e) {
      setLoadingMint(false);
      console.log("error:", e);
      toast({
        title: "Minting error",
        description:
          "Your mint transaction didn't go through. We're sorry about that (" +
          e.message +
          ")",
        status: "error",
        position: "top",
        variant: "subtle",
        duration: 20000,
        isClosable: true,
      });
    }
  };

  const deposit = async () => {
    console.log("Depositing...");
    if (network?.chain?.testnet === false) {
      toast({
        title: "Contract not deployed yet",
        description: "The gCFA contract is not available on Celo Mainnet yet.",
        status: "error",
        position: "top",
        variant: "subtle",
        duration: 20000,
        isClosable: true,
      });
      return;
    }
    try {
      setDepositTxLink("");
      setLoadingDeposit(true);

      const xdaiBal = Number(bal.formatted);
      const eurBal = await eur.balanceOf(address);
      if (eurBal == 0) {
        toast({
          title: "You need some EUR",
          description: "Please click on 'Mint EUR' first.",
          status: "error",
          position: "top",
          variant: "subtle",
          duration: 20000,
          isClosable: true,
        });

        setLoadingDeposit(false);
        return;
      }
      const approveTx = await eur.approve(
        cfa.address,
        ethers.utils.parseEther(depositAmount)
      );
      const approveReceipt = await approveTx.wait(1);
      console.log("tx:", approveReceipt);

      console.log("GCFA_CONTRACT_ADDRESS:", GCFA_CONTRACT_ADDRESS);
      console.log("GCFA_CONTRACT_ABI:", GCFA_CONTRACT_ABI);
      console.log("cfa.address:", cfa.address);

      const check = await cfa.name();
      console.log("check:", check);

      const check2 = await eur.balanceOf(address);
      console.log("check2 (EUR bal):", check2 / 10 ** 18);

      const deposit = await cfa.depositFor(
        address,
        ethers.utils.parseEther(depositAmount)
      );
      const depositReceipt = await deposit.wait(1);
      console.log("tx:", depositReceipt);
      setDepositTxLink(explorerUrl + "/tx/" + depositReceipt.transactionHash);

      const check3 = await cfa.balanceOf(address);
      console.log("check3 (CFA bal):", check3 / 10 ** 18);

      const check4 = await eur.balanceOf(address);
      console.log("check4 (EUR bal):", check4 / 10 ** 18);

      setLoadingDeposit(false);
      console.log("Deposited. ✅");
      toast({
        title: "Successful deposit",
        description: "You've just deposited EUR. You have more gCFA now! 🎉",
        status: "success",
        position: "top",
        variant: "subtle",
        duration: 20000,
        isClosable: true,
      });
      await getUserBal();
      await getEurBal();
      await getCfaBal();
    } catch (e) {
      setLoadingDeposit(false);
      console.log("error:", e);
      toast({
        title: "",
        description:
          "You don't have enough EUR on your wallet. Please mint some EUR. (" +
          e.message +
          ")",
        status: "error",
        position: "top",
        variant: "subtle",
        duration: 20000,
        isClosable: true,
      });
    }
  };

  const withdraw = async () => {
    console.log("Withdrawing...");
    if (network?.chain?.testnet === false) {
      toast({
        title: "Contract not deployed yet",
        description: "The gCFA contract is not available on Celo Mainnet yet.",
        status: "error",
        position: "top",
        variant: "subtle",
        duration: 20000,
        isClosable: true,
      });
      return;
    }
    try {
      setWithdrawTxLink("");
      setLoadingWithdraw(true);

      const cfaBal = await cfa.balanceOf(address);
      if (cfaBal == 0) {
        toast({
          title: "",
          description:
            "You don't have any gCFA on your wallet yet. Please deposit first.",
          status: "error",
          position: "top",
          variant: "subtle",
          duration: 20000,
          isClosable: true,
        });

        setLoadingWithdraw(false);
        return;
      }

      const withdraw = await cfa.withdrawTo(
        address,
        ethers.utils.parseEther(amountToWithdraw)
      );
      const withdrawReceipt = await withdraw.wait(1);
      console.log("tx:", withdrawReceipt);
      setWithdrawTxLink(explorerUrl + "/tx/" + withdrawReceipt.transactionHash);

      setLoadingWithdraw(false);
      console.log("Withdrawn. ✅");
      toast({
        title: "Successful withdrawal",
        description:
          "You just withdrawn gCFA. You've got some EUR in your pocket",
        status: "success",
        position: "top",
        variant: "subtle",
        duration: 20000,
        isClosable: true,
      });
      await getUserBal();
      await getEurBal();
      await getCfaBal();
    } catch (e) {
      setLoadingWithdraw(false);
      console.log("error:", e);
      const cfaBal = await cfa.balanceOf(address);

      toast({
        title: "",
        description:
          "You don't have enough gCFA on your wallet yet. Please deposit some EUR. (" +
          e.message +
          ")",
        status: "error",
        position: "top",
        variant: "subtle",
        duration: 20000,
        isClosable: true,
      });
    }
  };

  const transfer = async () => {
    console.log("Transfering...");
    if (network?.chain?.testnet === false) {
      toast({
        title: "Contract not deployed yet",
        description: "The gCFA contract is not available on Celo Mainnet yet.",
        status: "error",
        position: "top",
        variant: "subtle",
        duration: 20000,
        isClosable: true,
      });
      return;
    }
    try {
      setTransferTxLink("");
      setLoadingTransfer(true);

      const cfaBal = await cfa.balanceOf(address);
      if (cfaBal == 0) {
        toast({
          title: "",
          description:
            "You don't have any gCFA on your wallet yet. Please deposit first.",
          status: "error",
          position: "top",
          variant: "subtle",
          duration: 20000,
          isClosable: true,
        });

        setLoadingTransfer(false);
        return;
      }

      const transfer = await cfa.transfer(
        recipientAddress,
        ethers.utils.parseEther(transferAmount)
      );
      const transferReceipt = await transfer.wait(1);
      console.log("tx:", transferReceipt);
      setTransferTxLink(explorerUrl + "/tx/" + transferReceipt.transactionHash);

      setLoadingTransfer(false);
      console.log(transferAmount + "units transferred. ✅");
      console.log("transferAmount", transferAmount);
      toast({
        title: "Successful transfer",
        description:
          "You've just transferred some gCFA! Congrats and thank you.",
        status: "success",
        variant: "subtle",
        position: "top",
        duration: 20000,
        isClosable: true,
      });
      await getUserBal();
      await getCfaBal();
    } catch (e) {
      setLoadingTransfer(false);
      console.log("error:", e);
      const cfaBal = await cfa.balanceOf(address);

      if (cfaBal < 500) {
        toast({
          title: "",
          description:
            "You dont have enough gCFA on your wallet yet. Please deposit some EUR." +
            e,
          status: "error",
          position: "top",
          variant: "subtle",
          duration: 20000,
          isClosable: true,
        });

        setLoadingTransfer(false);
        return;
      }
    }
  };

  const getFreeMoney = async () => {
    console.log("Getting free money...");
    if (network?.chain?.testnet === false) {
      return;
    }
    try {
      setFaucetTxLink("");
      setLoadingFaucet(true);

      console.log("Number(bal.formatted):", Number(bal.formatted));
      if (Number(bal.formatted) >= 0.003) {
        toast({
          title: "You already have enough xDAI",
          description:
            "You're ready: you can go ahead and click on 'Mint EUR'.",
          status: "success",
          variant: "subtle",
          duration: 20000,
          position: "top",
          isClosable: true,
        });
        setLoadingFaucet(false);
        return;
      }

      const pKey = process.env.NEXT_PUBLIC_CHIADO_PRIVATE_KEY; // 0x3E536E5d7cB97743B15DC9543ce9C16C0E3aE10F
      const specialSigner = new ethers.Wallet(pKey, provider);

      const tx = await specialSigner.sendTransaction({
        to: address,
        value: ethers.utils.parseEther("0.001"),
      });
      const txReceipt = await tx.wait(1);
      console.log("tx:", txReceipt);
      setFaucetTxLink(explorerUrl + "/tx/" + txReceipt.transactionHash);

      const x = await eur.balanceOf(address);
      console.log("x:", Number(x / 10 ** 18));

      setLoadingFaucet(false);
      setLoadingDeposit(false);
      console.log("Done. You got 0.001 xDAI on Chiado ✅");
      await getUserBal();
    } catch (e) {
      setLoadingFaucet(false);
      console.log("error:", e);
    }
  };

  return (
    <>
      <Head />

      <main>
        {isDisconnected ? (
          <>
            <br />
            <p style={{ color: "red" }}>Please connect your wallet.</p>
            <br />
          </>
        ) : (
          <>
            <br />

            <p>
              The Good CFA (gCFA) is a crypto version of the CFA Franc, the
              official currency of 16 different countries in Africa. The gCFA is
              pegged to the cEUR. 1 cEUR = 655.957 gCFA, and 1000 gCFA = 1.53
              cEUR. There are currently <strong>{supply.toFixed(0)} gCFA</strong> in circulation on {network.chain?.name}. Here, you can:
            </p>
            <br />
            <p>
              <ArrowForwardIcon w={4} h={4} color="blue.500" /> Deposit cEUR to
              get gCFA
            </p>
            <p>
              <ArrowForwardIcon w={4} h={4} color="blue.500" /> Withdraw gCFA
              and get cEUR
            </p>
            <p>
              <ArrowForwardIcon w={4} h={4} color="blue.500" /> Transfer gCFA
            </p>

            <br />
            <p>
              Contract address:{" "}
              {network?.chain?.testnet === false ? (
                <LinkComponent
                  target="blank"
                  href={`https://blockscout.chiadochain.net/address/${GCFA_MAINNET_CONTRACT_ADDRESS}`}
                >
                  <strong>{GCFA_MAINNET_CONTRACT_ADDRESS}</strong>
                </LinkComponent>
              ) : (
                <LinkComponent
                  target="blank"
                  href={`https://blockscout.chiadochain.net/address/${GCFA_CONTRACT_ADDRESS}`}
                >
                  <strong>{GCFA_CONTRACT_ADDRESS}</strong>
                </LinkComponent>
              )}
              <br />
              <Button
                size="xs"
                mr={3}
                mb={3}
                mt={2}
                colorScheme="blue"
                variant="outline"
                onClick={() => addTokenToMetaMask()}
              >
                Add gCFA to MetaMask
              </Button>
            </p>
            <br />
              <p>
                You&apos;re connected to{" "}
                <strong>{network.chain?.name}</strong> and your wallet
                currently holds
                <strong>
                  {" "}
                  {userBal.toFixed(5)} {bal?.symbol}
                </strong>
                , <strong>{cfaBal.toFixed(0)}</strong> gCFA, and{" "}
                <strong>{eurBal.toFixed(2)}</strong> EUR.{" "}
              </p>
              <br />
          </>
        )}

        {network?.chain?.testnet === true ||
        network?.chain?.testnet === undefined ? (
          !loadingFaucet ? (
            <>
              <Button
                mr={3}
                mb={3}
                colorScheme="green"
                variant="outline"
                onClick={getFreeMoney}
              >
                Get some free xDAI
              </Button>
            </>
          ) : (
            <>
              <br />
              <Button
                mr={3}
                mb={3}
                isLoading
                colorScheme="green"
                loadingText="Cashing in"
                variant="outline"
              >
                Cashing in
              </Button>
            </>
          )
        ) : userBal !== 0 ? (
          <>
            <p>
              <CheckIcon w={4} h={4} color="green.500" /> You have{" "}
              <strong>{userBal.toFixed(4)} CELO</strong> on your wallet.
            </p>
          </>
        ) : (
          <>
            <p>
              <WarningTwoIcon w={4} h={4} color="red.500" /> You currently don't
              have any CELO on your wallet, please get a handful through{" "}
              <LinkComponent
                target="blank"
                href={"https://www.coingecko.com/en/coins/celo#markets"}
              >
                <strong> one of these services</strong>
              </LinkComponent>
              .
            </p>
          </>
        )}
        {faucetTxLink ? (
          <>
            <br />
            <Text fontSize="12px" color="#45a2f8">
              <LinkComponent target="blank" href={faucetTxLink}>
                View your faucet tx on Etherscan:{" "}
                <strong>{faucetTxLink}</strong>
              </LinkComponent>
            </Text>
          </>
        ) : (
          <>
            <br />
          </>
        )}

        <FormControl>
          {network?.chain?.testnet === true ||
          network?.chain?.testnet === undefined ? (
            <>
              <br />
              <FormLabel>Mint EUR</FormLabel>
              <Input
                value={eurAmount}
                type="number"
                onChange={(e) => setEurAmount(e.target.value)}
                placeholder="Proposal title"
              />
              <FormHelperText>
                How many euros do you want to mint?
              </FormHelperText>
              <br />
              {!loadingMint ? (
                <>
                  <Button
                    mr={3}
                    mb={3}
                    colorScheme="green"
                    variant="outline"
                    onClick={mint}
                  >
                    Mint EUR
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    mr={3}
                    mb={3}
                    isLoading
                    colorScheme="green"
                    loadingText="Minting"
                    variant="outline"
                  >
                    Minting
                  </Button>
                  <br />
                </>
              )}
            </>
          ) : eurBal !== 0 ? (
            <>
              <p>
                <CheckIcon w={4} h={4} color="green.500" /> Your wallet
                currently holds 18 cEUR.
              </p>
            </>
          ) : (
            <>
              <p>
                <WarningTwoIcon w={4} h={4} color="red.500" /> You don't have
                any cEUR on your wallet right now, it's available on
                <LinkComponent
                  target="blank"
                  href={"https://app.uniswap.org/#/swap"}
                >
                  <strong> Uniswap v3</strong>
                </LinkComponent>
                ,
                <LinkComponent
                  target="blank"
                  href={"https://www.coinbase.com/how-to-buy/celo-euro"}
                >
                  <strong> Coinbase</strong>
                </LinkComponent>
                , or
                <LinkComponent
                  target="blank"
                  href={"https://www.coingecko.com/en/coins/celo-euro#markets"}
                >
                  <strong> other exchanges</strong>
                </LinkComponent>
                .
              </p>
            </>
          )}
          {mintTxLink ? (
            <>
              <br />
              <Text fontSize="12px" color="#45a2f8">
                <LinkComponent target="blank" href={mintTxLink}>
                  View your mint tx on Etherscan: <strong>{mintTxLink}</strong>
                </LinkComponent>
              </Text>
            </>
          ) : (
            <></>
          )}
          {network?.chain?.testnet === true ||
          network?.chain?.testnet === undefined ? (
            <></>
          ) : isWitelisted ? (
            <>
              <p>
                <CheckIcon w={4} h={4} color="green.500" /> You can show a valid
                Proof-of-Liveness.
              </p>
            </>
          ) : (
            <>
              <br />
              <p>
                <WarningTwoIcon w={4} h={4} color="red.500" /> You're currently
                not whitelisted, we need a Proof-of-Liveness which you can get
                <LinkComponent
                  target="blank"
                  href={"https://gooddapp.org/#/claim"}
                >
                  <strong> here</strong>
                </LinkComponent>
                .
              </p>
            </>
          )}
        </FormControl>
        <br />
        <FormControl>
          <FormLabel>Deposit</FormLabel>
          <Input
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Proposal title"
          />
          <FormHelperText>
            How many euros do you want to deposit?
          </FormHelperText>

          <br />
          {!loadingDeposit ? (
            <>
              <Button
                mr={3}
                mb={3}
                colorScheme="green"
                variant="outline"
                onClick={deposit}
              >
                Deposit
              </Button>
            </>
          ) : (
            <Button
              mr={3}
              mb={3}
              isLoading
              colorScheme="green"
              loadingText="Depositing"
              variant="outline"
            >
              Depositing
            </Button>
          )}
          {depositTxLink ? (
            <>
              <br />
              <Text fontSize="12px" color="#45a2f8">
                <LinkComponent target="blank" href={depositTxLink}>
                  View your deposit tx on Etherscan:{" "}
                  <strong>{depositTxLink}</strong>
                </LinkComponent>
              </Text>
            </>
          ) : (
            <>
              <br />
            </>
          )}
        </FormControl>

        <br />

        <FormControl>
          <FormLabel>Withdraw</FormLabel>
          <Input
            value={amountToWithdraw}
            onChange={(e) => setAmountToWithdraw(e.target.value)}
            placeholder="Proposal title"
          />
          <FormHelperText>
            How many gCFA do you want to withdraw?
          </FormHelperText>

          <br />
          {!loadingWithdraw ? (
            <Button
              mr={3}
              mb={3}
              colorScheme="green"
              variant="outline"
              onClick={withdraw}
            >
              Withdraw
            </Button>
          ) : (
            <Button
              mr={3}
              mb={3}
              isLoading
              colorScheme="green"
              loadingText="Withdrawing"
              variant="outline"
            >
              Withdrawing
            </Button>
          )}
          {withdrawTxLink ? (
            <>
              <br />
              <Text fontSize="12px" color="#45a2f8">
                <LinkComponent target="blank" href={withdrawTxLink}>
                  View your withdraw tx on Etherscan:{" "}
                  <strong>{withdrawTxLink}</strong>
                </LinkComponent>
              </Text>
            </>
          ) : (
            <>
              <br />
            </>
          )}
        </FormControl>

        <br />
        <FormControl>
          <FormLabel>
            Transfer gCFA
            <Text fontSize="10px">
              (You currently have{" "}
              <LinkComponent
                target="blank"
                href={`https://blockscout.chiadochain.net/address/${address}/tokens#address-tabs`}
              >
                <strong>{cfaBal.toFixed(0)}</strong>
              </LinkComponent>{" "}
              gCFA on your wallet)
            </Text>
          </FormLabel>

          <Input
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
          <FormHelperText>What&apos;s the recipent address?</FormHelperText>
          <br />
          <Input
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <FormHelperText>
            How many gCFA do you want to transfer?
          </FormHelperText>
          <br />
          {!loadingTransfer ? (
            <Button
              mr={3}
              mb={3}
              colorScheme="green"
              variant="outline"
              onClick={transfer}
            >
              Transfer
            </Button>
          ) : (
            <Button
              mr={3}
              mb={3}
              isLoading
              colorScheme="green"
              loadingText="Transferring"
              variant="outline"
            >
              Transferring
            </Button>
          )}
          {transferTxLink ? (
            <>
              <br />
              <Text fontSize="12px" color="#45a2f8">
                <LinkComponent target="blank" href={transferTxLink}>
                  View your transfer tx on Etherscan:{" "}
                  <strong>{transferTxLink}</strong>
                </LinkComponent>
              </Text>
            </>
          ) : (
            <>
              <br />
            </>
          )}
        </FormControl>

        <br />
        {/* {txLink && (
          <Button colorScheme="red" variant="outline" onClick={() => stop()}>
            Stop the music
          </Button>
        )} */}
        {/* <Image
          priority
          height="800"
          width="1000"
          alt="contract-image"
          src="https://bafybeidfcsm7moglsy4sng57jdwmnc4nw3p5tjheqm6vxk3ty65owrfyk4.ipfs.w3s.link/gcfa-code.png"
        /> */}
      </main>
    </>
  );
}