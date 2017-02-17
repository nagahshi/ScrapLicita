'use strict'
let webdriverio = require('webdriverio');
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
  let j = 0, biddings = new Array, reg = new RegExp('^[0-9]+$');
  for(let i = 0;i < res.length; i++){
    if(i != 0){
      if(j == 5){j = 1;}else{j++;}
      if(j == 5){
        let str_dt = res[(i-1)].replace(/\D/g,''),day,month,year,hour;
        day = str_dt.substr(0,2);
        month = str_dt.substr(2,2);
        year = str_dt.substr(4,4);
        hour = ' '+str_dt.substr(8,2)+':'+str_dt.substr(10,2)+':00';
        biddings.push({
          state:'sp',
          edital_number:res[(i-4)],
          control:'ENPSP_'+res[(i-4)],
          client:{name:res[(i-3)]},
          bid_at:year+'-'+month+'-'+day+hour,
          object:res[i]
        });
      }
    }
  }
  console.log(biddings);
}).pause(1000).end();
