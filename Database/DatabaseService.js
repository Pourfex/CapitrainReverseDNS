const mongoose = require('mongoose');

const packet = new mongoose.Schema({
    domain: { type: String },
    ip: { type: String },
    bytes: { type: Number }
});

const Packet = mongoose.model('packets', packet);

module.exports = {
    SaveNewPacket : async function(json){
        //Needed because KafKa send us a json
        json = JSON.parse(json);
        
        let newPacket = new Packet({
            'ip' : json.ip,
            'bytes' : json.bytes
        });

        await newPacket.save(function(err, packet){
            if (err) console.error(err);
        });
    },

    PacketModel : Packet
};