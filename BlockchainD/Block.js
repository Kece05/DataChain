const { GENESIS_DATA, AUTHORITIES, getAuthorityHash } = require('./config');
const cryptoHash = require('./crypto-hash');

class Block {

    constructor( {lastHash, hash, data, Private_Key, authority} ) {
        this.timestamp = getCurrentDateTimeEST();
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.Private_Key = Private_Key;
        this.authority = authority;
    }
    
    static genesis() {
        return new this(GENESIS_DATA)
    }
//Make so the authority is added on to the block and not initally given
    static NewBlock( lastHash , Private_Key, data, creator ) {
        const time = getCurrentDateTimeEST();
        const Hash = cryptoHash(data, time, lastHash) 

        return new Block({
            timestamp: time,
            hash: Hash,
            lastHash: lastHash,
            Private_Key: Private_Key,
            data: data,
            authority: getAuthorityHash(Private_Key, Hash, creator)
        });
    
    }

}

function getCurrentDateTimeEST() {
    const options = {
      timeZone: 'America/New_York', 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
  
    const currentDateTimeEST = new Date().toLocaleString('en-US', options);
    return currentDateTimeEST;
  }
  
  
module.exports = {Block, getCurrentDateTimeEST };