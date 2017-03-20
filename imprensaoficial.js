var Horseman = require("node-horseman");
var horseman = new Horseman();
var moment = require('moment');
var request = require('request');
var host = 'http://159.203.173.193/bidding/url';
var links = [];

function getLinks(){
  return horseman.evaluate( function(){
    var links = [];
    $("#ResultadoBusca_dtgResultadoBusca tbody a").each(function( item ){
      var link = {
        control : 'imprensaoficial',
        link : 'https://www.imprensaoficial.com.br/ENegocios/'+$(this).attr("href"),
      };
      links.push(link);
    });
    return links;
  });
}

function hasNextPage(){
  return horseman.exists("#ResultadoBusca_PaginadorBaixo_btnProxima");
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
            .click("#ResultadoBusca_PaginadorBaixo_btnProxima")
            .waitForNextPage()
            .waitForSelector('#filtroBuscaControle_lblDocumentosEncontrado')
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
.open('https://www.imprensaoficial.com.br/ENegocios/BuscaENegocios_14_1.aspx')
.select('#Status_cboAberturaSecaoInicioDia',moment().add(9,'days').format('D'))
.select('#Status_cboAberturaSecaoInicioMes',moment().add(9,'days').format('M'))
.select('#Status_cboAberturaSecaoFimDia',moment().add(9,'days').format('D'))
.select('#Status_cboAberturaSecaoFimMes',moment().add(9,'days').format('M'))
.click('#btnBuscar')
.waitForNextPage()
.waitForSelector('#filtroBuscaControle_lblDocumentosEncontrado')
.then( scrape )
.finally(function(){
  request.post({
    url: host,
    form: {items:JSON.stringify(links)},
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
      'Content-Type' : 'application/x-www-form-urlencoded'
    },
    method: 'POST'
  },function (e, r, body) {
    console.log(body);
  });
  horseman.close();
});
