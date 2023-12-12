class TransactionWtoW {
    constructor({Sender, Reciever, verify, token}) {
        this.Sender = Sender; //The sender
        this.Reciever = Reciever; //The receiver
        this.verify = verify; //The recievers public-key
        this.token = token;
    }

    Transfer() {
        if (this.token.Transferable && this.Sender.tokens && this.Sender.tokens.length > 0) {
            if (this.verify == this.Reciever.publicKey && this.Sender.tokens.includes(this.token)) {
                this.Reciever.tokens.push(this.token);
                const tokenIndex = this.Sender.tokens.indexOf(this.token);
                if (tokenIndex !== -1) {
                    this.Sender.tokens.splice(tokenIndex, 1);
                }
            }
        }
    }
}

module.exports = TransactionWtoW;