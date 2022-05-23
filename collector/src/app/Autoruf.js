import puppeteer from "puppeteer";
import { Autoruf } from "../scenarios/dromru/index.js";

export default class App {

    config;
    browser;

    constructor(config = {}) {
        this.config = config;
        this.browser = false;
    }

    async init() {
        this.browser = await puppeteer.launch(this.config.browser);
        let pages = await this.browser.pages();
        await pages[0].authenticate(this.config.browser.proxy);

        const autoruf = new Autoruf(this.browser, this.config);
        try {
            if(await autoruf.run()){
                await this.browser.close();
                await this.init();
            }
        } catch (e) {
            await this.browser.close();
            await this.init();
        }

        return this;
    };

    async close(){
        return await this.browser.close();
    }
}
