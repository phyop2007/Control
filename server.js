var express = require('express'),
	app = express(),
	stripe = require("stripe")(
		"sk_test_PemncDJakbsXxUgyBe4uodxN"
	);

stripe.charges.list(
  function(err, charges) {
  	/*
	app.get('/', function (req, res) {
	  res.send(charges.data);
	});
	*/
	var past_week = new Date();
		past_week.setDate(past_week.getDate()-7);
	var	unix_past_week = Date.parse(past_week)/1000;
	var successful_charge = 0,
		successful_amount = 0;	
	for(var i = 0; i < charges.data.length; i++) {
		var newCharge = new Charge();
		newCharge.id = charges.data[i].id;
		newCharge.amount = charges.data[i].amount;
		newCharge.paid = charges.data[i].paid;
		newCharge.status = charges.data[i].status;
		newCharge.created = charges.data[i].created;
		if(newCharge.status == 'succeeded' && newCharge.paid == true){
			if(newCharge.created >= unix_past_week) {
				successful_charge += 1;
				successful_amount += newCharge.amount;
			}
		}
	  }
	 var rJSON = getSevenDayRevenue(successful_amount, successful_charge, unix_past_week);
	  
	  show_on_server(rJSON);
	  
});	

function getSevenDayRevenue(successful_amount, successful_charge, unix_past_week) {
	var r = new sevenDayRevenue();
	  r.total_amount = successful_amount;
	  r.total_charge = successful_charge;
	  r.start_datetime = unix_past_week;
	  rJSON = JSON.	stringify(r);
	  
	  return rJSON;
}

 function Charge(id, amount, paid, status, created) {
	this.id = id;
	this.amount = amount;
	this.paid = paid;
	this.status = status;
	this.created = created;
 }
 
 function sevenDayRevenue(total_amount, total_charge, start_datetime) {
	this.label = "Seven Day Total Successful Revenue";
	this.total_amount = total_amount;
	this.total_charge = total_charge;
	this.start_datetime = start_datetime;
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