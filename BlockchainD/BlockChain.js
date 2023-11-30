const {Block} = require('./Block');
const cryptoHash = require('./crypto-hash');
const { AUTHORITIES, replaceSHA256 } = require('./config');


class Blockchain {
    constructor()  {
        this.chain = [Block.genesis()];
        this.wallets = [];
    }

    addBlock({ Data, creator }) {
        const lastHash =  this.chain[this.chain.length-1].hash;
        const Private_Key = this.chain[this.chain.length-1].Private_Key;
        const newBlock = Block.NewBlock(lastHash, Private_Key, Data, creator);
    
        this.chain.push(newBlock);
    }

    //Used to Make invalid blocks
    //will not be on the offical version
    test({ Data, lastHash, creator }) {
        const Private_Key = this.chain[this.chain.length - 1].Private_Key;
        const newBlock = Block.NewBlock(lastHash, Private_Key, Data, creator);
        this.chain.push(newBlock);
    }

    static isValidchain(Chain) {
        var bool = true;
        if (JSON.stringify(Chain[0]) !== JSON.stringify(Block.genesis())) bool = false;

        for (let i = 1; i < Chain.length; i++ ) {
            const block = Chain[i];
            const {timestamp, lastHash, hash,  data, authority} = block;
            const Hash = cryptoHash(data, timestamp, lastHash) 

            if (lastHash !== Chain[i-1].hash || Hash !== block.hash){
                const newKey = replaceSHA256(Chain[i].hash);
                Chain[i].authority = false;
                for (let k = 0; k < Chain.length; k++) {
                    if (Chain[k].authority) {
                        Chain[k].Private_Key = newKey;
                    }
                }
                bool = false;
            };
        }
        return bool;
    }

    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error("The incoming chain must be longer");
            return;
        }

        if (!Blockchain.isValidchain(chain)) {
            console.error("The incoming chain must be valid");
            return;
        }
        this.chain = chain
    }

}

module.exports = Blockchain;