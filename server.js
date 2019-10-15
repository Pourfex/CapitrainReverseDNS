console.log("started");

const mongoose = require('mongoose');
const whoIsService = require('./whoisService');


var url = 'mongodb://localhost/Capitrain';



mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var db = mongoose.connection;

db.once('open', function() {
    console.log("Connection successful");

    //faster than model
    db.db.collection("packets", function(err, collection){
        collection.find({}).toArray(function(err,data){
            console.log(data);
            data.forEach(async (value) => {
                try{
                    value.domain = await whoIsService.WhoIs(value.ip);
                    console.log(value.domain);
                }catch(e){
                    console.log(e);
                }                
            });
        })
    });
  });


    /* MyModel.find(function(err, packets){
        console.log(packets);         
    }); */

/* const packet = new mongoose.Schema({
    domain: { type: String },
    ip: { type: String },
    bytes: { type: Number }
});

const MyModel = mongoose.model('packets', packet); */