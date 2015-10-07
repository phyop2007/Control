var express = require('express'),
	app = express(),
	stripe = require("stripe")(
		"sk_test_PemncDJakbsXxUgyBe4uodxN"
	);
	
var today = new Date(),
	past_week = new Date(),
	last_month = new Date();

	past_week.setDate(past_week.getDate()-7);
	last_month.setMonth(last_month.getMonth()-1);
		
var	unix_past_week = getUnixDate(past_week),
	unix_last_month = getUnixDate(last_month),
	successful_charge = 0,
	successful_amount = 0;	
		
stripe.charges.list(
  { "created[gt]": unix_last_month, limit: 1000},
  function(err, charges) {
	for(var i = 0; i < charges.data.length; i++) {
		if(charges.data[i].status == 'succeeded' && charges.data[i].paid == true){
			if(charges.data[i].created >= unix_past_week) {
				successful_charge += 1;
				successful_amount += charges.data[i].amount;
			}
		}
		
		if(charges.data[i].failure_code) 
			console.log(charges.data[i].failure_code);
		if(charges.data[i].status == 'failed' && charges.data[i].card_error == 'card_declined' ) {
			if(charges.data[i].created >= unix_last_month) {
				console.log(charges.data[i]);
			}
		}
		//charges have customers
		if(charges.data[i].customer) {
			stripe.customers.listCards(charges.data[i].customer, function(err, cards) {
				for(var c = 0; c < cards.data.length; c++) {
					//same year, near to expire but can be better here.
					if(cards.data[c].exp_year == today.getFullYear()) {
						console.log(cards.data[c]);
					}
				}
			});
		}
	  }
	
	var sevenDayRevenue = getSevenDayRevenue(successful_amount, successful_charge, past_week);
	
		
	
	allResults = new returnObj(today, sevenDayRevenue) ;
	  
	rJSON = JSON.stringify(allResults);
	//show_on_server(charges);
	//show_on_server(allResults);
	  
});	


function returnObj (today, sevenDayRevenue) {
	this.today = today;
	this.sevenDayRevenue = sevenDayRevenue;

}
 
 function getSevenDayRevenue(total_amount, total_charge, start_datetime){
	var r = new sevenDayRevenue();
		r.total_amount = total_amount;
		r.total_charge = total_charge;
		r.start_datetime = start_datetime;
	return r;
 }
 
 function sevenDayRevenue(total_amount, total_charge, start_datetime) {
	this.label = "Seven Day Total Successful Revenue";
	this.total_amount = total_amount;
	this.total_charge = total_charge;
	this.start_datetime = start_datetime;
 }

function getUnixDate(date_obj){
	return Date.parse(date_obj)/1000;
} 
 
 
function show_on_server(rJSON) {
	  app.get('/', function (req, res) {
		  res.send(rJSON);
	 });
}
	 
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log (' Server is running at port: 3000' );
});