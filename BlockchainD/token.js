const { getCurrentDateTimeEST } = require('./Block');
const { findName_throughHash } = require('./config');
const cryptoHash = require('./crypto-hash');

class Token {
    constructor( {timestamp, ISSUER, Name, data, Transferable} ) {
        this.timestamp = getCurrentDateTimeEST();
        this.ISSUER = ISSUER;
        this.Name = Name;
        this.data = data;
        this.Transferable = Transferable;
    }

    static createTokens({block, NumTokens, TokenName, data, transferable}) {
        if (block.authority && NumTokens > 0) {
            const creator = findName_throughHash(block.hash);
            var token_list = [];

            if (!(block["Tokens"] == null)) {
                for (let i = 0; i < block["Tokens"].length; i++) {
                    token_list.push(block["Tokens"][i]);
                }
            }
            for (let i = 0; i < NumTokens; i++) {
                const privatek = cryptoHash(JSON.stringify(block), creator, block.lastHash);
                const newToken = new Token({
                                            timestamp: "",
                                            ISSUER: creator,
                                            Name: TokenName,
                                            data: data,
                                            Transferable: transferable
                                        });
                token_list.push(newToken);
            }

            block["Tokens"] = token_list;
        }
        return block;
    }

    static removeInvalidTokens(block) {
        const creator = findName_throughHash(block.hash);
        var InvalidTokens = [];
        for (let i = 0; i < block.Tokens.length; i++ ) {
            const token = block.Tokens[i]
            if (!(creator == token.ISSUER)) {
                InvalidTokens.push(i);
            }
        }

        InvalidTokens.reverse()
        for (let i = 0; i < InvalidTokens.length; i ++) {
            console.log(`Token Removed at Index: ${InvalidTokens[i]}`);
            block.Tokens.splice(InvalidTokens[i],1);
        }
    }
}

module.exports = Token;