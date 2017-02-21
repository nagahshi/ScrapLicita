'use strict'

let webdriverio = require('webdriverio');
let request = require('request');
let host = 'http://159.203.173.193/bidding';
let options = {
  desiredCapabilities: {
    browserName: 'firefox'
  }
};

webdriverio
.remote(options)
.init()
.url('http://e-negocioscidadesp.prefeitura.sp.gov.br/BuscaLicitacao.aspx')
.pause(1000)
.click('#ctl00_cphConteudo_frmBuscaLicitacao_ibtBuscar')
.pause(1000)
.getText('td').then((res)=>{
  res = res.filter((value)=>{ return value != ''; });
  let j = 0, reg = new RegExp('^[0-9]+$');
  for(let i = 0;i < res.length; i++){
    if(i != 0){
      if(j == 5){j = 1;}else{j++;}
      if(j == 5){
        let str_dt = res[(i-1)].replace(/\D/g,''),bidding = new Object,day,month,year,hour;
        day = str_dt.substr(0,2);
        month = str_dt.substr(2,2);
        year = str_dt.substr(4,4);
        hour = ' '+str_dt.substr(8,2)+':'+str_dt.substr(10,2)+':00';
        bidding.state = 'sp';
        bidding.edital_number = res[(i-4)];
        bidding.control = 'ENPSP_'+res[(i-4)];
        bidding.client = res[(i-3)];
        bidding.bid_at = year+'-'+month+'-'+day+hour;
        bidding.object = res[i];
        bidding.link = 'http://e-negocioscidadesp.prefeitura.sp.gov.br/';
        request.post({
          url: host,
          form: bidding,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
            'Content-Type' : 'application/x-www-form-urlencoded'
          },
          method: 'POST'
        },function (e, r, body) {
          console.log(body);
        });
      }
    }
  }
}).pause(1000).end();
