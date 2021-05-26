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

app.get("/", function(req,res){
  res.render("main");
});


app.post("/", function(req,res){

  const pincode = req.body.Pincode;
  // console.log(pincode);

  const url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=" + pincode + "&date=26-05-2021";

  const options = { method : 'GET' };
  
    const request = https.request(url, options, function(response){
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
                    res.send("Currently No Slots Available....");
                  }
                  else
                  {
                    // res.send(result);
                    res.render("home",{data : result}); 
                  }
              });

              // response.on("data", function(data){
              //   if(data.length)
              //   {
              //     const result = JSON.parse(data).sessions;
              //     res.send(result);
  
              //     result.forEach(function(i){
              //       console.log(i.name);
              //     });
              //   }
              // }); //response.on()
            }
            else
            {
              res.sendFile(__dirname + "/failure.html"); 
            }   
      }); //https.request()
      request.end();

    }); //app.post()

    app.post("/failure", function(req,res){
      res.redirect("/");
    });

























app.listen(process.env.PORT || 3000, function(){
  console.log("Server running on port 3000....")
});