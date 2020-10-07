const https = require('https');
const fs = require('fs');

const args = process.argv.slice(2);
if (args.length !== 1) {
    console.log('One argument expected (git tag).');
    process.exit(1);
}
const tag = args[0];

const localJson = JSON.parse(fs.readFileSync('./composer.json'));

https.get(`https://raw.githubusercontent.com/dbrekelmans/browser-driver-installer/${tag}/composer.json`, (response) => {
    let data = '';
    response.on('data', (chunk) => {
        data += chunk;
    });

    response.on('end', () => {
        const remoteJson = JSON.parse(data);

        // Replace license
        localJson.license = remoteJson.license;

        // Extract 'php' and 'ext-' from require
        let localRequire = {};
        Object.entries(remoteJson.require).forEach(([key, value]) => {
            if (key === 'php' || key.startsWith('ext-')) {
                localRequire[key] = value;
            }
        })

        localJson.require = localRequire;

        fs.writeFileSync('./composer.json', JSON.stringify(localJson, null, 4));
    });

}).on('error', (error) => {
    console.log(`Error: ${error.message}`);
    process.exit(1);
});