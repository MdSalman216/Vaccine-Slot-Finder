// add .env command here
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const request = require("request");
const https = require("https");

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


// Covid 19 API call
let covidResult = {};
let confirmed, recovered, deaths;
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const options = { method : 'GET' };
const covidUrl = "https://covid19.mathdro.id/api/countries/India/";
const request1 = https.request(covidUrl, options, function(response){
  //Here response sent by the CoWin API

  if(response.statusCode === 200)
  {
    response.on('data', function(data) {

      covidResult = JSON.parse(data);

      confirmed = numberWithCommas(covidResult.confirmed.value);
      recovered = numberWithCommas(covidResult.recovered.value);
      deaths = numberWithCommas(covidResult.deaths.value);
      // console.log(confirmed,recovered,deaths);
    });
     
  }
  else
  console.log("error");
 
}); //https.request()
request1.end();

app.get("/", function(req,res){
  res.render("main", {confirmed:confirmed, recovered:recovered, deaths:deaths});
});


app.post("/", function(req,res){

const pincode = req.body.Pincode;

let d = new Date();
let date = d.getDate();
let month = d.getMonth()+1;
let year = d.getFullYear();
let currDate = date+"-"+month+"-"+year;
  
const cowinUrl = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=" + pincode + "&date=" + currDate;

  const options = { method : 'GET' };
  
    const request = https.request(cowinUrl, options, function(response){
            //Here response sent by the CoWin API
  
            let chunks = [];
            if(response.statusCode === 200)
            {
              response.on('data', function(data) {
                chunks.push(data);
              }).on('end', function() {
                let data = Buffer.concat(chunks);
                let result = JSON.parse(data).sessions;
                
                  if(result.length === 0)
                  {
                    res.render("failure", {content : "Currently No Slots are available. Pleasr Try Again Later.", 
                    confirmed:confirmed, recovered:recovered, deaths:deaths});
                  }
                  else
                  {
                    // res.send(result);
                    res.render("home",{data : result, confirmed:confirmed, recovered:recovered, deaths:deaths}); 
                  }
              });
            }
            else
            {
              res.render("failure",{content : "Please Enter Correct Pincode.", confirmed:confirmed, recovered:recovered, deaths:deaths}); 
            }   
      }); //https.request()
      request.end();

    }); //app.post()

    app.post("/failure", function(req,res){
      res.redirect("/");
    });

    
    app.listen(process.env.PORT || 3000, function(){
      console.log("Server Started on port 3000...")
    });