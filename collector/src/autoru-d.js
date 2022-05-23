import { App } from "./app/index.js";
import process from 'process';
import {Autoru} from "./scenarios/autoru/index.js";

const config = {

    browser: {
        user: 'd',
        headless: true,
        devtools: false,
        proxy: {
            username: 'EE7hMct1',
            password: 'mqKQgnn4'
        },
        args: [
            '--proxy-server=45.140.63.162:49084',
            '--window-size=1240,1024',
            '--no-first-run',
            '--disable-sync',
            '--disable-images',
            '--disable-dev-shm-usage',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-client-side-phishing-detection',

            '--disable-accelerated-jpeg-decoding',
            '--enable-deferred-image-decoding',
            '--site-per-process',
            '--disable-dev-shm-usage',
        ],
        defaultViewport: {
            width: 1240,
            height: 1024
        }
    }

};

console.log(`Process ID: ${process.pid}`);
process.on('SIGHUP', () => console.log('Received: SIGHUP'));

process.on('beforeExit', (code) => {
    console.log('Process beforeExit event with code: ', code);
});

process.on('exit', (code) => {
    console.log('Process exit event with code: ', code);
});

process.argv.forEach((value, index)=>{
    if(value === '--bot'){
        config.browser.user = process.argv[index + 1];
    }
});

(new App(config)).init().then(async (BOT) => {

});
