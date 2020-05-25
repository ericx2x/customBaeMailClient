const bsv = require('bsv')
const Message = require('bsv/message');
const ECIS = require('electrum_ecies');
var options = {
  api_key: ''
}
const mattercloud = require('mattercloudjs').instance(options);

var privateKeyString = '';
var payPrivateKey = bsv.PrivateKey.fromWIF(privateKeyString);
var fundsAddress = '';
var baemailPki = '';
var protocol_prefix = '';

var senderPrivateKey = '';
var servicePki = '';
var servicePaymail = '';

const encryptBae = (data, pubkey) => {
  let encryptedData = ECIES.encrypt(data, pubkey);
  return Buffer.from(encryptedData, 'base64');
}

const baeSign = (data) => {
  let privKey = bsv.PrivateKey.fromWIF(senderPrivateKey);
  let signature = Message.sign(data, privKey);
  return signature;
}

const Baemail = {}
Baemail.create = async (message, amount, subject, recievePaymail, recievePubkey) => {
  const baemail = {body:{time:Date.now(), blocks: [{ type: "paragraph", data:{ text: message }}]}}  //format baemail message
  userPaymail = receivePaymail; userPki = recievePubkey;
  const dataToEncrypt = JSON.stringify(baemail) // message content
  Baemail.baemailData = JSON.stringify({
     summary: 'Open Baemail',
    amountUsd: amount,
    to: userPaymail,
    cc: [],
    subject: subject,
    salesPitch: '',
    from: {
      name: servicePaymail,
      primaryPaymail: servicePaymail,
      pki: servicePki
    }
  })

  let OP_RETURN = [protocol_prefix]; //1
  // encrypt baemail data object to Baemails' paymail/public key
  OP_RETURN.push(encryptBae(Baemail.maemailData, baemailPki)); // 2

  // encrypt baemail message to sender's public key
  OP_RETURN.push(encryptBae(dataToEncrypt, userPki)); // 4

  // sign sha256 hash of data
  // SHA-256 hash of protocol prefix = baemail data object, converted to hex
  const baeHash = bsv.crypt.Hash.sha256(bsv.deps.Buffer.from(protocol_prefix + Baemail.baemailData)).toString('hex');

  // add pipe, AIP protocol prefix, hash, signature, sender public key, sender paymail 5 - 10 
  OP_RETURN.push('|', '', baeHash, baeSignature, servicePki, servicePaymail);
  return OP_RETURN;
}

async function createTx(msg, amt, subj, recPaymail, recPubkey) {
  // fetch UTXOs from mattercloud merchant API
  let utxos = await mattercloud.getUtxos(fundsAddress);
  let utxo = utxos[0];
  // The amount of Satoshis is based on the 'satoshis' in the object above
  let transaction = new bsv.Transaction().from(utxo);
  // change back to sending address
  transaction.change(utxo.address);
  let op_returnData = await Baemail.create(msg, amt, subj, recPaymail, recPubkey);
  transaction.addSafeData(op_returnData);
  transaction.to('', 600); // pay Baemail
  transaction.to('', 12000); // recipent
  // calculate fee for transaction
  transaction.getFee();
  transaction.sign(payPrivateKey);
  // turn this Transaction into a hex that we broadcast to Bitcoin
  let hex = transaction.serialize(true);
  let tx = await mattercloud.merchantTxBroadcast(hex);
  console.log('txid:', tx.result);
  return tx.result.txid;
}

module.exports = {
  createTx: createTx
}
