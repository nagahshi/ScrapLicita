var Horseman = require("node-horseman");
var horseman = new Horseman();
var moment = require('moment');
var request = require('request');
var host = 'http://159.203.173.193/bidding';
var links = [];

horseman
.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
.open('http://www1.dnit.gov.br/editais/consulta/editais2.asp')
.wait(10000)
.type('#yadcf-filter--tabela-from-date-5',moment().format('DD/MM/Y'))
.type('#yadcf-filter--tabela-to-date-5',moment().add(1,'years').format('DD/MM/Y'))
.type('#yadcf-filter--tabela-8',moment().format('Y'))
.select('[name="tabela_length"]',-1)
.wait(10000)
.evaluate( function(){
  var links = [];
  $("#tabela tbody tr").each(function( item ){
    var bidding = new Object;
    bidding.client = $($(this).find('td').get(0)).text().trim();
    var str_dt = ''+$($(this).find('td').get(4)).text().trim().replace(/\D/g,'');
    if(str_dt!='') str_dt = str_dt.substr(-4,4)+'-'+str_dt.substr(-6,2)+'-'+str_dt.substr(-8,2)+' 23:59:00';
    bidding.state = '';
    var states = [{'key':'ac','name':'acre'},{'key':'al','name':'alagoas'},{'key':'ap','name':'amapá'},
    {'key':'am','name':'amazonas'},{'key':'ba','name':'bahia'},{'key':'ce','name':'ceará'},{'key':'df','name':'distrito federal'},
    {'key':'es','name':'espírito santo'},{'key':'go','name':'goiás'},{'key':'ma','name':'maranhão'},
    {'key':'mt','name':'mato grosso'},{'key':'ms','name':'mato grosso do sul'},{'key':'mg','name':'minas gerais'},
    {'key':'pa','name':'pará'},{'key':'pb','name':'paraíba'},{'key':'pr','name':'paraná'},{'key':'pe','name':'pernanbuco'},
    {'key':'pi','name':'piauí'},{'key':'rj','name':'rio de janeiro'},{'key':'rn','name':'rio grande do norte'},
    {'key':'rs','name':'rio grande do sul'},{'key':'ro','name':'rondônia'},{'key':'rr','name':'roraima'},
    {'key':'sc','name':'santa catarina'},{'key':'sp','name':'são paulo'},{'key':'se','name':'sergipe'},
    {'key':'to','name':'tocantins'}];
    states.forEach(function(value){
      var rgxp = new RegExp(value.name, "gi");
      if(bidding.client.match(rgxp)) bidding.state = value.key;
    });
    bidding.state = (bidding.state != '')?bidding.state:'df';
    bidding.bid_at = str_dt;
    bidding.edital_number = $($(this).find('td').get(3)).text().trim();
    bidding.control = 'DNIT_'+bidding.edital_number;
    bidding.object = $($(this).find('td').get(5)).text().trim();
    bidding.link = 'http://www1.dnit.gov.br/editais/consulta/';
    bidding.link = bidding.link+$($(this).find('a').get(1)).attr('href').trim();
    links.push(bidding);
  });
  return links;
})
.then(function(links){
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
})
.finally(function(){
horseman.close();
});
