console.log("started");

const mongoose = require('mongoose');
const whoIsService = require('./whoisService');
const brokerService = require('./RabbitMq/BrokerService');
const databaseService = require ('./Database/DatabaseService');

var url = 'mongodb://localhost/Capitrain';

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var connection = mongoose.connection;

connection.once('open', function() {
    console.log("Connection successful");

    databaseService.PacketModel.find(function(err, packets){
        console.log(packets); 
        packets.forEach(async (packet) => {
            if(!packet.domain){
                console.log("no domain, need WhoIs");
                try{
                    packet.domain = await whoIsService.WhoIs(packet.ip);
                    console.log(packet.domain);
                    packet.save(function(err, packet){
                        if (err) console.error(err);
                    });
                }catch(e){
                    console.log(e);
                }
            }                                
        });    
    });

    //faster than model finding
    /* connection.db.collection("packets", function(err, collection){
        collection.find({}).toArray(function(err,data){
            console.log(data);
            data.forEach(async (value) => {
                if(!value.domain){
                    console.log("no domain, need WhoIs");
                    try{
                        value.domain = await whoIsService.WhoIs(value.ip);
                        console.log(value.domain);
                    }catch(e){
                        console.log(e);
                    }
                }                                
            });
        })
    }); */

    //We start the broker receiving once the db is connected
    brokerService.StartReceiving();
  });

  //example sending a packet
  let examplePacket = {
      'bytes' : 48,
      'ip' : '179.60.192.7'
  }

  console.log(JSON.stringify(examplePacket))
  brokerService.Send(JSON.stringify(examplePacket));