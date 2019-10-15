var amqp = require('amqplib/callback_api');
const packetQueue = "packets";
const databaseService = require ('../Database/DatabaseService');

module.exports = {
    Send : function (message){
        amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            var queue = packetQueue;
            var msg = message;

            channel.assertQueue(queue, {
                durable: false
            });
            channel.sendToQueue(queue, Buffer.from(msg));

            console.log(" [x] Sent %s", msg);
        });
        setTimeout(function() {
            connection.close();
        }, 500);
    });
    },

    StartReceiving : function(){   

        amqp.connect('amqp://localhost', function(error0, connection) {
            if (error0) {
                throw error0;
            }
            connection.createChannel(function(error1, channel) {
                if (error1) {
                    throw error1;
                }

                var queue = packetQueue;

                channel.assertQueue(queue, {
                    durable: false
                });

                console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

                channel.consume(queue, function(msg) {
                    console.log(" [x] Received %s", msg.content.toString());
                    databaseService.SaveNewPacket(msg.content.toString());  
                }, {
                    noAck: true
                });
            });
        });
    }
};

