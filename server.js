const express = require('express');
const axios = require('axios');
const bae = require('./openBaemail');
const app = express();
const port = '8001';

let mbUrl = 'https://www.moneybutton.com/api/v1/bsvalias/id/';
let relayUrl = 'https://relayx.io/bsvalias/id/';
app.use(express.urlencoded({extend: true}));
app.listen(port, () => { console.log('Baemail server listening on port ${port}... );});
app.get('/', async(req, res) => { res.sendFile('client.html', { root: __dirname }); });
app.post('/', async(req, res) => {
  let paymail = req.body.paymail;
  let message = req.body.message;
  let amount = req.body.amount;
  let subject = req.body.subject;
  axios.get(relayUrl + paymail).then(function(response) {
    publicKey = response.data.pubkey;
    let result = bsv.createTx(message, amount, subject, paymail, publicKey);
    res.send('Baemail sent!');
  }).catch(function(error) {
    console.log(error);
  });

});
