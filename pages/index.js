import Head from 'next/head'
import { useState, useEffect } from 'react'
import Web3 from 'web3'
import willyTokenContract from '../blockchain/myFirstApp.js'



/* ---------JavaScript--------- */




/* ---------REACT--------- */
const MyFirstApp = () => {
    /* ---------Sends--------- */
    

    /* ---------Messages--------- */

    //Wallet Msg
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    //Balance Msg
    const [msgBalance, setMsgBalance] = useState('')
    //Mint Msg
    const [msgMint, setMsgMint] = useState('')
    //Transfer Msg
    const [msgTransfer, setMsgTransfer] = useState('')
    //TODO: TxHash
    //const [txHash, setTxHash] = useState('')


    const [totalSupply, getTotalSupply] = useState("...")
    const [users, getNumOfUsers] = useState("...")

    /* ---------Calls--------- */

    const [addressBalance ,getAddressBalance] = useState(null)
    const [mintTokens, setMintTokens] = useState('')

    const [transferAddress, setTrasnferAddress] = useState('')
    const [transferAmount, setTransferAmount] = useState('')

    /* ---------Web3--------- */
    const [web3, setWeb3] = useState(null)
    const [address, setAddress] = useState(null)
    const [vmContract, setVmContract] = useState(null)
    const [showConnect, setShowConnect] = useState(true)

    
    /* ---------UseEffects--------- */
    useEffect(() => {
        if(vmContract) getTotalSupplyHandler()
        if(vmContract) getNumOfUsersHandler()
        if(vmContract && address) setShowConnectHandler()
        //Check for address change
        if(vmContract && address){setInterval(() => {
            const accounts = web3.currentProvider.selectedAddress
            //Check if a address is connected first
            if(accounts !== null){
                //Check if the new address == current known address
                if(accounts.toUpperCase() !== address.toUpperCase()){
                    //console.log(accounts, address)
                    setAddress(accounts)      

                }
            }
            //If accounts == null, then show `connect wallet` button again
            else{
                setShowConnect(true)
            }

        }, 1000);}


    },[vmContract, address]) //These functions will only run IF vmContract or address changes
    
    useEffect( () => {

        if(vmContract){setInterval(() => {
            //Rinkey ChainID: 4
            //Polygon ChainID: 137
            if(window.ethereum.networkVersion == "137" ){
                //setCorrectNetwork(true)
                correctNetworkToast()
            }
            else{
                console.log('ERROR: window.ethereum.networkVersion:', window.ethereum.networkVersion);
                incorrectNetworkToast();
            }
      

        }, 1000);}


    })
  



    function copyToClipboardToast() {
        // Get the snackbar DIV
        var x = document.getElementById("copyToClipboardDiv");
      
        // Add the "show" class to DIV
        x.className = "show";
      
        // After 3 seconds, remove the show class from DIV
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    
        //Copy Address to clipboard
        navigator.clipboard.writeText(address)
    }

    function incorrectNetworkToast() {
        console.log("incorrectNetworkToast")
        // Get the snackbar DIV
        var x = document.getElementById("incorrectNetworkDiv");
      
        // Add the "show" class to DIV
        x.className = "show";
      
        // After 3 seconds, remove the show class from DIV
        //setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);

    }

    function correctNetworkToast(){
        var x = document.getElementById("incorrectNetworkDiv");
        x.className = "";
    }

    function walletErrorToast() {
        console.log("badWalletToast")
        // Get the snackbar DIV
        var x = document.getElementById("incorrectWalletDiv");
      
        // Add the "show" class to DIV
        x.className = "show";
      
        // After 3 seconds, remove the show class from DIV
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }


    /* ---------Calls--------- */
    const getNumOfUsersHandler = async () => {
        const users = await vmContract.methods.totalUsers().call()
        getNumOfUsers(users)
    }

    const getTotalSupplyHandler = async () => {
        const totalSupply = await vmContract.methods.friendlyCurrentSupply().call()
        getTotalSupply(totalSupply)
    }

    const setShowConnectHandler = async () =>{
        setShowConnect(false)
    }

    const updateQueryAddress = event => {
        getAddressBalance(event.target.value)
    }
    
    const queryWillyTokensHandler = async() => {
        try{
            const userBalance = await vmContract.methods.balanceOf(addressBalance).call()
            const convertedUserBalance = ((web3.utils.fromWei(userBalance, 'ether'))) //Convert wei(1/18 of Eth) to ether for display
            setMsgBalance(convertedUserBalance)
        }catch(err){
            if(err.message == "Cannot read properties of null (reading 'methods')"){
                setMsgBalance("Error: Please connect wallet before calling functions")
            }
            else{
                setMsgBalance(err.message.substr(0,95))
                //error message may potentially be too long. `console.log` the error just in case.
                console.log(err.message)
            }
        }
    }


    
    /* ---------Sends--------- */

    const updateMintQty = event =>{
       setMintTokens(event.target.value)
    }
    
    const mintTokensHandler = async() =>{   
        try{
            const gasPrice = await web3.eth.getGasPrice();
            gasPrice = parseInt(gasPrice)
            await vmContract.methods.mint(mintTokens).send({
                from: address,
                gasPrice: gasPrice
            })
            setMsgMint(`${mintTokens} Willy Tokens Minted!`)

            if(vmContract) getTotalSupplyHandler()
            if(vmContract) getNumOfUsersHandler()
        }catch(err){
            if(err.message == "Cannot read properties of null (reading 'methods')"){
                setMsgMint("Error: Please connect wallet before calling functions")
            }
            else{
                setMsgMint(err.message.substr(0,95)) 
            }
            //error message may potentially be too long. `console.log` the error just in case.
            console.log(err.message) 
        }

    }

    const updateTransferAddress = event =>{
        setTrasnferAddress(event.target.value)
        
    }

    const updateTransferAmount = event =>{
        setTransferAmount(event.target.value)
    }

    const transferTokenHandler = async() =>{

        try{
            const gasPrice = await web3.eth.getGasPrice();
            gasPrice = parseInt(gasPrice)
            await vmContract.methods.transfer(transferAddress, web3.utils.toWei(transferAmount, 'ether')).send({
                from: address,
                gasPrice: gasPrice
                //gasPrice: 100000000000
            })

            setMsgTransfer(`${transferAmount} Willy Tokens succesfully sent to address: ${transferAddress}`)
            if(vmContract) getNumOfUsersHandler()
        }catch(err){
            if(err.message == "Cannot read properties of null (reading 'methods')"){
                setMsgTransfer("Error: Please connect wallet before calling functions")
            }
            else{
                setMsgTransfer(err.message.substr(0,95))
                //error message may potentially be too long. `console.log` the error just in case.
                console.log(err.message)
            }
            
        }
    }

    /* ---------Wallet Handler--------- */
    const connectWalletHandler = async () => {
        console.log("connectWalletHandler Called")
        if(typeof window !== "undefined" && typeof window.ethereum !== "undefined"){
            console.log("MetaMask Detected")
            try{

                console.log("try")
                await window.web3.currentProvider.enable();
                console.log("await enable success")
                web3 = new Web3(window.ethereum)
                setWeb3(web3) 
                console.log("web3 set")
                
                //get list of accounts
                //const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts()
                setAddress(accounts[0])
                console.log("account set")
                
                if (window.ethereum.networkVersion == "137"){
                    console.log(window.ethereum.networkVersion, 'window.ethereum.networkVersion');
                    //create local contract copy
                    const vm = willyTokenContract(web3)
                    setVmContract(vm)
                }
                else{
                    console.log('ERROR: Initial window.ethereum.networkVersion:', window.ethereum.networkVersion);
                    incorrectNetworkToast();
                    return;
                }
            } catch(err){
                setError(err.message)
                walletErrorToast()
                console.log(err.message)
            }

        }
        else{
            setError("Please Install The Metamask Wallet")
            walletErrorToast()
           
            console.log("Please Install Metamask Wallet")
        }

    }

    /* ---------Add Token Info--------- */
    const tokenAddress = '0x2057201F0302D873439feA544Ed3c7542ACc48e1';
    const tokenSymbol = 'WILLY';
    const tokenDecimals = 18;
    const tokenImage = 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Professionelle_reinigung_%28W%29.svg';

    const addTokenHandler = async () =>{
        try {
            // wasAdded is a boolean. Like any RPC method, an error may be thrown.
            const wasAdded = await ethereum.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20', // Initially only supports ERC20, but eventually more!
                options: {
                  address: tokenAddress, // The address that the token is at.
                  symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                  decimals: tokenDecimals, // The number of decimals in the token
                  image: tokenImage, // A string url of the token logo
                },
              },
            });
          
          } catch (error) {
            console.log(error);
            setError(error.message);
            walletErrorToast();
          }
    }

    /* ---------Nav for Mobile Use--------- */
    function openNav() {
        console.log("OpenNav Called")
        var x = document.getElementById("nav")
        x.style.display = "block";
        console.log("display is none, so set to block")
    }
    function closeNav() {
        console.log("OpenNav Called")
        var x = document.getElementById("nav")
        x.style.display = "none";
        console.log("display is block, so set to none")
    }

    return( 
        <div className= "app">
            <Head>
                <title>Willy Token</title>
                <meta name="description" content="A blockchain app" />    
                
            </Head>
            
            <div id="copyToClipboardDiv">Address Copied To Clipboard</div>
            <div id="incorrectNetworkDiv">Incorrect Network. Please switch to the Polygon Network</div>
            <div id="incorrectWalletDiv">{error}</div>
            <body>
                <header>
                    <div className="test">
                        <div className="symbol_logo">
                            <img src = "https://upload.wikimedia.org/wikipedia/commons/9/9e/Professionelle_reinigung_%28W%29.svg" className="nav-image" />
                            <a className="logo" href="#">Willy <span>Token</span></a>   
                    
                        </div>
                        <nav id="nav">
                            <ul className ="primary-nav" >
                                <li className = "exit-button-li"> <a className = "exit-button" onClick = {() => {closeNav();}}>Exit</a></li>
                                <li><a href="https://polygonscan.com/address/0x2057201f0302d873439fea544ed3c7542acc48e1" target="_blank" rel="noreferrer">Contract</a></li> 
                                <li><a href="https://github.com/Wilson-Wu1/WillyToken" target="_blank" rel="noreferrer">GitHub</a></li> 
                                <li><a href="https://www.linkedin.com/in/wilson-wu-2021/" target="_blank" rel="noreferrer">LinkedIn</a></li> 
                            </ul>                                                                                 
                        </nav>
                    </div>


                    <div className ="button-div">
                        <button className="button-add-token" onClick={addTokenHandler}><img src="https://upload.wikimedia.org/wikipedia/commons/9/9e/Professionelle_reinigung_%28W%29.svg" className="button-add-token-img"></img><p className="button-add-token-p">Add Token</p></button>
                        {showConnect?
                        <button 
                        onClick={connectWalletHandler} 
                        className= "button">Connect Wallet
                        
                        </button>:  
                        <div className="button-change">
   
                            <button onClick = {() => {copyToClipboardToast();}}
                                    
                                className = "button-change-address">{address.substring(0,5).concat("...").concat(address.substring(38,43))}
                                
                            </button>                
                        </div>
                        }

                    </div>
                    <svg viewBox="0 0 100 80" width="28" height="28" className="hamburger" onClick = {() => {openNav();}}>
                        <rect width="100" height="10"></rect>
                        <rect y="30" width="100" height="10"></rect>
                        <rect y="60" width="100" height="10"></rect>
                    </svg>
                </header>


                <section className="hero">
                
                    <div className="container">
                        
                   
                        <div className = "left-col">
                            <h1>Willy <span>Token</span></h1>   
                            <h2>An ERC20 Token Built On The Polygon Blockchain</h2>                           
                            <p className="subhead">Written with Solidity, Web3.js, React.js, HTML and CSS</p>

                            <div className="hero-cta">
                                <button 
                                    onClick={connectWalletHandler} 
                                    className= "hero-button">Connect Wallet
                                </button>
                                <a href="#trade-now-anchor" className="trade-now">Trade Now</a>

                            </div>
                        </div>
                        <img src = "https://upload.wikimedia.org/wikipedia/commons/9/9e/Professionelle_reinigung_%28W%29.svg" className="hero-image" />
                        
                    </div>
                    
                </section>

                <section className="token">
                    <hr className="token-hr"></hr>
                    <div className ="token-info-container">
                        <img src="https://i.gifer.com/Fw3P.gif" className = "token-img"></img>
                        
                    </div>
                    <p className ="token-info-text-top">Used by Millions</p>
                    <p className ="token-info-text-bottom">Trusted by Billions</p>
                    <div className = "token-info-medium-div"><p className ="token-info-medium">A modern meta-verse, MMORPG, Play-To-Earn project with over a million users.</p></div>
                    <div className = "token-info-medium-div"><p className ="token-info-medium1">Token owners will have special access to the upcoming Big Willy NFT launch and DAO for project governance.</p></div>
                    <p className ="token-info-small">Definetly not a simple ERC20 Token</p>
                    <div className="token-container1">
                    
                        <div className="token-left">Number Of Users
                            <div className="token-left-box">
                                <p className="token-left-text">{users}</p>
                            </div>
                            
                        </div>
                        

                        <div className="token-middle">Circulating Supply 
                            <div className="token-middle-box">
                                <p className="token-middle-text">{totalSupply}</p>
                            </div>
                        </div>
                        <div className="token-right">Maximum Supply
                            <div className="token-right-box">
                                <p className="token-right-text">100,000</p>
                            </div>
                        </div>
                    </div>

                    
                </section>

                <section className="sc">
                    
                    <p className="sc-header" id="trade-now-anchor">Own a Willy Today</p>
                    <p className="sc-header1">It&apos;s As Easy As <span className="sc-123">1 - 2 - 3</span></p>
                    
                    <div className = "sc-container">
                    
                    <div className ="sc-query">
                        <p className = "sc-query-text">Query</p>                       
                        <p className = "sc-query-info">Curious? Query the <span>Willy</span> Token balance of any user</p>
                        <hr className = "sc-query-hr"></hr>
                        <div className = "sc-query-container">
                            <p className="sc-query-msg">Query Address:</p>
                            <input onChange={updateQueryAddress} className="sc-query-input" placeholder="Address"/>
                            <button  onClick={queryWillyTokensHandler} className="sc-query-button">Query</button>
                            <p>{msgBalance}</p>
                        </div>

                    </div>
                    <div className ="sc-mint">
                        <p className = "sc-mint-text">Mint</p>
                        <p className = "sc-mint-info">Craving more Willys? Mint up to 10 free <span>Willy</span> Tokens</p>
                        <hr className = "sc-mint-hr"></hr>
                        <div className = "sc-mint-container">
                            <p className="sc-mint-msg">Mint Token Amount:</p>
                            <input onChange={updateMintQty} className="sc-mint-input" placeholder="Amount"/>
                            <button onClick={mintTokensHandler} className="sc-mint-button">Mint</button>
                            <p>{msgMint}</p>
                        </div>
                    </div>
                    <div className ="sc-transfer">
                        <p className = "sc-transfer-text">Transfer</p>
                        <p className = "sc-transfer-info">Share a <span>Willy</span> with a friend! Transfer your <span>Willy</span> Tokens</p>
                        <hr className = "sc-transfer-hr"></hr>
                        <div className = "sc-transfer-container">
                            <p className="sc-transfer-msg1">To Address:</p>
                            <input onChange={updateTransferAddress}className="sc-transfer-input1" placeholder="Address"/>
                            <p className="sc-transfer-msg2">Send Token Amount:</p>
                            <input onChange={updateTransferAmount}className="sc-transfer-input2" placeholder="Amount"/>
                            <button onClick={transferTokenHandler }className="sc-transfer-button">Transfer</button>
                            <p>{msgTransfer}</p>
                        </div>
                        
                        
                    </div>
                    <img src="https://multimatic.io/static/media/rocket.b3957e8f.webp" className ="rocket"></img>
                    </div>
                    
                </section>
                

                
            </body>
        </div>
    )
}

export default MyFirstApp