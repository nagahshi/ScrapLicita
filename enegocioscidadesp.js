var Horseman = require("node-horseman");
var horseman = new Horseman();
const moment = require('moment');
var request = require('request');
var host = 'http://159.203.173.193/bidding';
var links = [];

function getLinks(){
  return horseman.evaluate( function(){
    var links = [];
    $(".grid-resultado tbody tr").each(function( item ){
      var str_dt = ''+$($(this).find('td').get(3)).text().trim().replace(/\D/g,'');
      if(str_dt!=''){
        str_dt = str_dt.substr(-8,4)+'-'+str_dt.substr(-10,2)+'-'+str_dt.substr(-12,2)+' '+str_dt.substr(-4,2)+':'+str_dt.substr(-2,2);
      }else{
        var d = new Date();
        str_dt = d.getFullYear()+'-'+('00'+(d.getMonth()+1)).slice(-2)+'-'+('00'+(d.getDate()+1)).slice(-2)+' 00:00:00';
      }
      var edital = $($(this).find('td').get(0)).text().trim();
      var bidding = {
        state: 'sp',
        edital_number : edital,
        control:'ENPSP_'+edital,
        client: $($(this).find('td').get(1)).text().trim(),
        bid_at: str_dt,
        object: $($(this).find('td').get(4)).text().trim(),
        link: 'http://e-negocioscidadesp.prefeitura.sp.gov.br/'
      };
      links.push(bidding);
    });
    return links;
  });
}

function hasNextPage(){
  return horseman.exists("#ctl00_cphConteudo_gdvResultadoBusca_pgrGridView_btrNext_lbtText");
}

function scrape(){
  return new Promise( function( resolve, reject ){
    return getLinks()
    .then(function(newLinks){
      links = links.concat(newLinks);
      if (links.length < 300){
        return hasNextPage()
        .then(function(hasNext){
          if (hasNext){
            return horseman
            .click("#ctl00_cphConteudo_gdvResultadoBusca_pgrGridView_btrNext_lbtText")
            .waitForSelector('#ctl00_cphConteudo_gdvResultadoBusca_pgrGridView_pnlResults')
            .then( scrape );
          }
        });
      }
    })
    .then( resolve );
  });
}

horseman
.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
.open('http://e-negocioscidadesp.prefeitura.sp.gov.br/BuscaLicitacao.aspx')
.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js')
.type('input[name="ctl00$cphConteudo$frmBuscaLicitacao$txtDataPublicacaoInicio"]',moment().add(-1,'days').format('DD/MM/Y'))
.type('input[name="ctl00$cphConteudo$frmBuscaLicitacao$txtDataPublicacaoFim"]',moment().add(-1,'days').format('DD/MM/Y'))
.click('input[name="ctl00$cphConteudo$frmBuscaLicitacao$ibtBuscar"]')
.waitForNextPage()
.waitForSelector('#ctl00_cphConteudo_gdvResultadoBusca_ifbGridView_lnkNovaBusca')
.then( scrape )
.finally(function(){
  for(i=0;i <= links.length;i++){
    var bidding = links[i];
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
  horseman.close();
});
