const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
    WhoIs : async function (ip){
        const { stdout, stderr } = await exec('nslookup ' + ip);

        if (stderr) {
            console.error(`error: ${stderr}`);
        }
        return stdout.split("Nom :")[1].split("Address:")[0].replace(/\s/g, '');
    }
};