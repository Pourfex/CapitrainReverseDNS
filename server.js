console.log("started");

const mongoose = require('mongoose');
const whoIsService = require('./whoisService');
const brokerService = require('./RabbitMq/BrokerService');
const databaseService = require ('./Database/DatabaseService');

var url = 'mongodb://localhost/CapiTrain2';

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var connection = mongoose.connection;

const fillDb = async function(packets){
    console.log(packets.length)
    for(const packet of packets) {
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
    };
    return true;    
}

connection.once('open', function() {
    console.log("Connection successful");

    databaseService.PacketModel.find(async function(err, packets){
        console.log(packets); 
        let i,j, temparray, chunk = 100
        for (i=0,j=packets.length; i<j; i+=chunk) {
            temparray = packets.slice(i,i+chunk);
            await fillDb(temparray)
        }
        
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
    //brokerService.StartReceiving();
  });

/*   //example sending a packet
  let examplePacket = {
      'bytes' : 48,
      'ip' : '179.60.192.7'
  }

  console.log(JSON.stringify(examplePacket))
  brokerService.Send(JSON.stringify(examplePacket)); */