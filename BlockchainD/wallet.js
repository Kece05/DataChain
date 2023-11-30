const {ec, cryptoHash} = require('./ellipitic');
//const Transaction = require("./Useless_4rn/transaction");

class Wallet {
    constructor(name) {
        this.name = name;
        this.tokens = [];
        this.keyPair = ec.genKeyPair()
        this.publicKey = this.keyPair.getPublic().encode("hex");
    }

    addWallet(blockcahin) {
        blockchain.wallets.push(this);
    }
}

module.exports = Wallet;