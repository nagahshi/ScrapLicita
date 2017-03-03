'use strict'

let webdriverio = require('webdriverio');
let request = require('request');
let host = 'http://159.203.173.193/bidding';
var moment = require('moment');
let day = moment().add(10,'days').format("D");
let month = moment().add(10,'days').format("M");
let year = moment().add(10,'days').format("Y");
var page = 1;
let options = {
  desiredCapabilities: {
    browserName: 'firefox'
  }
};
webdriverio
.remote(options)
.init()
.url('https://www.imprensaoficial.com.br/ENegocios/BuscaENegocios_14_1.aspx')
.pause(500)
.selectByIndex('#Status_cboAberturaSecaoInicioDia',day)
.pause(500)
.selectByIndex('#Status_cboAberturaSecaoInicioMes',month)
.pause(500)
.selectByIndex('#Status_cboAberturaSecaoInicioAno',year)
.pause(500)
.selectByIndex('#Status_cboAberturaSecaoFimDia',day)
.pause(500)
.selectByIndex('#Status_cboAberturaSecaoFimMes',month)
.pause(500)
.selectByIndex('#Status_cboAberturaSecaoFimAno',year)
.pause(500)
.click('#btnBuscar')
.pause(500)
.getText('a').then((res)=>{
  res = res.filter((value)=>{ return value != ''; });
  for(let i = 0;i < res.length; i++){
    console.log(res[i]);
  }
}).pause(1000).end();
