const bsv = require("bsv");
const Mnemonic = require("bsv/mnemonic");

//12 Word Phrase
let phrase = "";

//BSV wallet derivation paths
let moneyButtonDerivationPath = "m/44'/0'/0'/0/0/0";
let simplyCashDerivationPath = "m/44'/0'/2/0";

//Check if phrase is valid.
let valid = Mnemonic.isValid(phrase);
console.log("Is phrase valid?", valid);

//Create mnemonic object from phrase
let mnemonic = Mnemonic.fromString(phrase);

//Get HD private key of mnemonic
let hdPrivateKey = bsv.HDPrivateKey.fromSeed(mnemonic.toSeed());

//Get xpriv key from derivation path set
let pathPk = hdPrivateKey.deriveChild(moneyButtonDerivationPath);

let privateKey = pathPk.privateKey.toString();
console.log('Private key:', privateKey);

let publicKey = bsv.PublicKey.fromPrivateKey(pathPk.privateKey);
console.log('Public key: ', publicKey.toString());
