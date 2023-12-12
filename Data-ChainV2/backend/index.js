const express = require('express');
const cors = require('cors');
const Blockchain = require("./BlockChain");
const Wallet = require('./wallet');
const nodemailer = require('nodemailer');
const CryptoJS = require("crypto-js");
const Token = require('./token');
const TransactionBtoW = require('./transaction_BtoW');
const TransactionWtoW = require('./transaction_WtoW');
const { getCurrentDateTimeEST } = require('./Block');

const app = express();
app.use(cors());

// Initialize a global blockchain variable
const blockchain = new Blockchain();

blockchain.addBlock({ Data: ["Hello, data is 25"] , creator: "Coopertino"});

// const [pair, pub] = new Wallet("k", "o", "fake@gmail").addWallet(blockchain);
// const [s, d] = new Wallet("f", "os", "fake@gmail").addWallet(blockchain);

// const private_key = pair.getPrivate().toString(16);

// // const [pair2, pub2] = new Wallet("j", "v", "fake@gmail").addWallet(blockchain);
// // const private_key2 = pair2.getPrivate().toString(16);

// console.log("Private 1: " + private_key);
// console.log("Public 1: " + pub);
// // console.log("");
// // console.log("Private 2: " + private_key2);
// // console.log("Public 2: " + pub2);



const data = ["I created this token to transfer ownship", "This token was created on 11/26/23",
                                "Sell this token and be smart", "This token is worth 0 BTC"];




const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 't9147783@gmail.com',
        pass: 'yhsuvkizjcrcaecx',
    },
});

app.get("/createWallet", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const email = req.query.email;

    if (!username || !password) {
        return res.status(400).json({ error: 'Both username and password are required' });
    }

    const [pair, pub]= new Wallet(username, password, email).addWallet(blockchain);
    const private_key = pair.getPrivate().toString(16);
    const emailText = `Dear ${username},

    We are pleased to inform you that your new wallet has been successfully created. Below, you will find essential information related to your wallet, so please ensure you store it securely.
    
    Private Key: ${private_key}
    This key is crucial for logging into your wallet securely.
    
    Public Key: ${pub}
    This key will be used for receiving new tokens.
    
    Please take a moment to store this information in a secure location. Additionally, we recommend deleting this email once you have safely recorded the details to enhance the security of your wallet.
    
    If you have any questions or concerns, feel free to reach out to our support team.
    
    Thank you for choosing our platform.
    
    Best regards,
    Data Chain
    `;

    res.status(200).json({ success: true });

    transporter.sendMail({
        from: 't9147783@gmail.com',
        to: email,
        subject: 'Important Information Regarding Your New Wallet',
        text: emailText,
    }, (error, info) => {
        if (error) {
            console.error('Error sending verification email:', error);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            console.log('Verification email sent:', info.response);
            res.status(200).json({ message: 'Registration successful. Verification email sent.' });
        }
    });
});

app.get("/accessWallet", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const private_key = req.query.private_key;

    let validLogin = false;

    for (let i = 0; i < blockchain.wallets.length; i++) {
        const currentWallet = blockchain.wallets[i];
        const fKey = currentWallet.keyPair.getPrivate().toString(16);

        if (currentWallet.username === username && currentWallet.password === password && fKey === private_key) {
            validLogin = true;
            numWallet = i;
            break;
        }
    }

    if (validLogin) {        
        const token = ((Math.random().toString(36)) + (Math.random().toString(36))).replace(/[^a-zA-Z0-9 ]/g, "").replace(/\//g, "");
        const encrypted = CryptoJS.AES.encrypt(username, token).toString();
        res.send([true, encrypted, token]);
    } else {
        res.send([false]);
    }
    
});

app.get("/requestWalletTokens", (req, res) => {
    const username = req.query.username;
    for (let i = 0; i < blockchain.wallets.length; i++) {
        const currentWallet = blockchain.wallets[i];
        if (currentWallet.username === username) {
            res.send(currentWallet["tokens"]);
            break;
        }
    }
});

app.get("/createTokens", (req, res) => {
    const data = req.query.data.split('\n').filter(item => item.trim() !== '');
    const hash = req.query.hash;
    const numTokens = parseInt(req.query.tokens);
    const tokenName = req.query.name;
    var transferable = req.query.transferable === "True"; 
    var block_to_add_Tokens = null;

    for (let i = 0; i < blockchain.chain.length; i++) {
        const currentBlock = blockchain.chain[i];
        if (currentBlock.hash === hash) {
            block_to_add_Tokens = i;
            break;
        }
    }
    
    if (block_to_add_Tokens !== null) {
        var call_block = blockchain.chain[block_to_add_Tokens];
        Token.createTokens({
            block: call_block,
            NumTokens: numTokens,
            TokenName: tokenName, 
            data: data,
            transferable: transferable 
        });
        Token.removeInvalidTokens(blockchain.chain[block_to_add_Tokens]);
        call_block["history"].push({"Number": numTokens, "Name": tokenName, "TimeStamp": getCurrentDateTimeEST()})
    }
});

app.get("/requestBlock", (req, res) => {
    const id = req.query.id;
    let found = false;

    for (let i = 0; i < blockchain.chain.length; i++) {
        const currentBlock = blockchain.chain[i];
        if (currentBlock.id === id) {
            const data = {
                "timestamp": currentBlock.timestamp,
                "hash": currentBlock.hash,
                "data": currentBlock.data,
                "authority": currentBlock.authority,
                "id": currentBlock.id,
                "username": currentBlock.username,
                "Tokens": currentBlock.Tokens
            };

            res.header("Content-Type", "application/json");
            res.send(JSON.stringify(data));
            found = true;
            break;
        }
    }

    if (!found) {
        res.status(404).send("Block not found");
    }
});


app.get("/History", (req, res) => {
    const username = req.query.username;

    for (let i = 0; i < blockchain.wallets.length; i++) {
        const currentWallet = blockchain.wallets[i];
        if (currentWallet.username === username) {
            res.send(currentWallet["history"]);
            break;
        }
    }
});

app.get("/HistoryB", (req, res) => {
    const id = req.query.id;

    for (let i = 0; i < blockchain.chain.length; i++) {
        const currentBlock = blockchain.chain[i];
        if (currentBlock.id === id) {
            res.send(currentBlock["history"]);
            break;
        }
    }
});

app.get("/accessBlock", (req, res) => {
    const id = req.query.id;
    const username = req.query.username;
    const password = req.query.password;

    for (let i = 0; i < blockchain.chain.length; i++) {
        const currentWallet = blockchain.chain[i];
        if (currentWallet.id === id) {
            console.log(i);
            if (currentWallet.username === '' && currentWallet.password === '') {
                currentWallet.username = username;
                currentWallet.password = password;
            } 

            if (currentWallet.username === username & currentWallet.password === password) {
                const token = ((Math.random().toString(36)) + (Math.random().toString(36))).replace(/[^a-zA-Z0-9 ]/g, "").replace(/\//g, "");
                const encrypted = CryptoJS.AES.encrypt(id, token).toString();
                res.send([true, encrypted, token]);
            } else {
                res.send([false]);
            }
        }
    }
});

app.get("/TransferToken", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const tokenHash = req.query.THash;
    const publicKey = req.query.public;

    var senderWallet = null;
    var recieversWallet = null;
    var tokenNum = null;
    var doneLoop = 0;

    for (let i = 0; i < blockchain.wallets.length; i++) {
        const currentWallet = blockchain.wallets[i];
        if (currentWallet.username == username && currentWallet.password == password) {
            for (let x = 0; x < currentWallet["tokens"].length; x++) {
                if (currentWallet["tokens"][x].TokenHash === tokenHash) {
                    senderWallet = i;
                    tokenNum = x;
                    doneLoop += 1;
                    break;
                }
            }
            if (doneLoop == 2) {
                break;
            }
        }
        if (publicKey === currentWallet.publicKey) {
            recieversWallet = i;
            doneLoop += 1;
            if (doneLoop == 2) {
                break;
            }
        }
    }

    if (senderWallet !== null && recieversWallet !== null && tokenNum !== null) {
        const transferFW = new TransactionWtoW({
            Sender: blockchain.wallets[senderWallet],
            Reciever: blockchain.wallets[recieversWallet], 
            verify: publicKey, 
            token: blockchain.wallets[senderWallet]["tokens"][tokenNum] 
        });

        transferFW.Transfer();
        blockchain.wallets[senderWallet]["history"].push({"SentToken": tokenHash, "ToWallet": publicKey,"TimeStamp": getCurrentDateTimeEST()})
        blockchain.wallets[recieversWallet]["history"].push({"ReceivedToken": tokenHash, "FromWallet": blockchain.wallets[senderWallet].publicKey,"TimeStamp": getCurrentDateTimeEST()})
        res.send(true)
    } else {
        res.send(false)
    }
});

app.get("/BTransfer", (req, res) => {
    const hash = req.query.hash;
    const password = req.query.password;
    const tokenHash = req.query.THash;
    const publicKey = req.query.public;

    var recieversWallet = null;
    var tokenNum = null;
    var block_to_add_Tokens = null;
    console.log(tokenHash);
    for (let i = 0; i < blockchain.chain.length; i++) {
        const currenBlock = blockchain.chain[i];
        if (currenBlock.hash == hash && currenBlock.password == password) {
            for (let x = 0; x < currenBlock["Tokens"].length; x++) {
                if (currenBlock["Tokens"][x].TokenHash === tokenHash) {
                    block_to_add_Tokens = i;
                    tokenNum = x;
                    break;
                }
            }
        }
    }

    for (let i = 0; i < blockchain.wallets.length; i++) {
        const currentWallet = blockchain.wallets[i];
        if (publicKey === currentWallet.publicKey) {
            recieversWallet = i;
            break;
        }
    }

    if (recieversWallet !== null && tokenNum !== null && block_to_add_Tokens !== null) {
        const transferTransaction1 = new TransactionBtoW({
            block: blockchain.chain[block_to_add_Tokens],
            wallet: blockchain.wallets[recieversWallet], 
            verify: publicKey, 
            token: blockchain.chain[block_to_add_Tokens].Tokens[tokenNum] 
        });
        transferTransaction1.Transfer();
        blockchain.wallets[recieversWallet]["history"].push({"ReceivedToken": tokenHash, "FromBlock": blockchain.chain[block_to_add_Tokens].hash, "TimeStamp": getCurrentDateTimeEST()})
        blockchain.chain[block_to_add_Tokens]["history"].push({"SentToken": tokenHash, "Reciever": blockchain.wallets[recieversWallet].publicKey, "TimeStamp": getCurrentDateTimeEST()})
        res.send(true)

    } else {
        res.send(false)
    }
});

//just for testing
app.get("/", (req,res) => {
    console.log(blockchain);
})

const PORT = 3023;
const listener = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// blockchain.addBlock({ Data: "Hello, data is 25" , creator: "Keller"}); //Add a new block


// //In the future, the there will be a script to search for a wallet through name or/and public key
// const transferTransaction = new TransactionBtoW({
//     block: call_block,
//     wallet: blockchain.wallets[0], //on front-end they will be able to choose
//     verify: blockchain.wallets[0].publicKey, //In the future will have to be something the block will have to enter
//     token: call_block.Tokens[1] //In the future the they be able to choose
// });

// Need to make Transactions more secure

// //Need to make more secure transfer