const Blockchain = require("./BlockchainD/BlockChain");
const Token = require('./BlockchainD/token');
const Wallet = require('./BlockchainD/wallet');
const TransactionBtoW = require('./BlockchainD/transaction_BtoW');
const TransactionWtoW = require('./BlockchainD/transaction_WtoW');


blockchain = new Blockchain(); //Start Blockchain

blockchain.addBlock({ Data: "Hello, data is 25" , creator: "Keller"}); //Add a new block

console.log(`Is the Blockchain valid: ${Blockchain.isValidchain(blockchain.chain)}`);//Check to make sure its valid
//If block is not valid, then the authority will be set to false and the block will lose privillage to create/transact tokens

const data = ["I created this token to transfer ownship", "This token was created on 11/26/23",
                    "Sell this token and be smart", "This token is worth 0 BTC"];

//In the future, the front end will already know which block
const block_to_add_Tokens = 1;
var call_block = blockchain.chain[block_to_add_Tokens];


Token.createTokens({
    block: call_block,
    NumTokens: 3,
    TokenName: "Test Token", 
    data: data,
    transferable:true //Block sets if the token can be transferred wallet to wallet
}); //Create token


//Scans through a blocks tokens and checks if they're valid, if not then they will be removed
Token.removeInvalidTokens(call_block)

//Need to add more security to wallets 
new Wallet("Test1").addWallet(blockchain); //created a wallet
new Wallet("Test2").addWallet(blockchain); //created a wallet

console.log("Before");
console.log(blockchain);

//In the future, the there will be a script to search for a wallet through name or/and public key
const transferTransaction = new TransactionBtoW({
    block: call_block,
    wallet: blockchain.wallets[0], //on front-end they will be able to choose
    verify: blockchain.wallets[0].publicKey, //In the future will have to be something the block will have to enter
    token: call_block.Tokens[1] //In the future the they be able to choose
});

// Call the Transfer method to perform the token transfer
// Need to make Transactions more secure
transferTransaction.Transfer();


const transferFW = new TransactionWtoW({
    Sender: blockchain.wallets[0],
    Reciever: blockchain.wallets[1], //on front-end they will be able to choose
    verify: blockchain.wallets[1].publicKey, //In the future will have to be something the sender will have to enter
    token: blockchain.wallets[0].tokens[0] //In the future the they be able to choose
});


//Need to make more secure transfer
transferFW.Transfer();

console.log("After: ");
console.log(blockchain);