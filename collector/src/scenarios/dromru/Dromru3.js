import fetch from "node-fetch";
import Scenario from "../../app/Scenario.js";

export default class Dromru3 extends Scenario {

    async run(){
        const url = 'https://drom.ru/';
        let pages = await this.browser.pages();
        let PAGE = pages[0];

        let cookies = await this.cookie.get(url);
        await PAGE.setCookie(...cookies);
        await PAGE.setDefaultTimeout(5000);


        await PAGE.setRequestInterception(true);
        PAGE.on('request', (req) => {
            if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
                //req.abort();
                req.continue();
            } else {
                req.continue();
            }
        });

        await PAGE.goto(url, { waitUntil: "domcontentloaded" });
        await PAGE.waitForTimeout(3000);
        await this.cookie.save(pages[0]);
        //return true;
        await PAGE.waitForTimeout(2000);
        await this.cookie.save(pages[0]);
        await PAGE.setUserAgent('Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36');

        /*****************************************************************/

        // todo: выбираем регион
        //await PAGE.waitForSelector('.GeoSelect__title-shrinker');
        console.log('1');
        const firstChildText = (selector) => {
            try {
                let collection = document.querySelectorAll(selector);
                return collection[0];
            }catch(e){
                return '';
            }
        };
        await PAGE.waitForSelector('.css-184qm5b');
        await PAGE.waitForTimeout(1000);
        console.log('2');

        // todo: применяем фильтр

        await PAGE.waitForTimeout(2000);
        let url_go = 'https://spb.drom.ru/auto/used/all/';
        var now = new Date();
        console.log(now.getMinutes());
        if(now.getMinutes()>=0){
            url_go = 'https://auto.drom.ru/region59/used/all/';
        }
        if(now.getMinutes()>=4){
            url_go = 'https://auto.drom.ru/region59/used/all/?distance=1000';
        }
        if(now.getMinutes()>=8){
            url_go = 'https://auto.drom.ru/region55/used/all/';
        }
        if(now.getMinutes()>=12){
            url_go = 'https://auto.drom.ru/region55/used/all/?distance=1000';
        }
        if(now.getMinutes()>=16){
            url_go = 'https://novosibirsk.drom.ru/auto/used/all/';
        }
        if(now.getMinutes()>=20){
            url_go = 'https://auto.drom.ru/region72/used/all/';
        }
        if(now.getMinutes()>=24){
            url_go = 'https://auto.drom.ru/region72/used/all/?distance=1000';
        }

        if(now.getMinutes()>=28){
            url_go = 'https://auto.drom.ru/region38/used/all/?distance=1000';
        }
        if(now.getMinutes()>=32){
            url_go = 'https://auto.drom.ru/region24/used/all/';
        }

        if(now.getMinutes()>=36){
            url_go = 'https://auto.drom.ru/region86/used/all/';
        }

        if(now.getMinutes()>=40){
            url_go = 'https://auto.drom.ru/region86/used/all/?distance=1000';
        }

        if(now.getMinutes()>=44){
            url_go = 'https://auto.drom.ru/used/all/page4/';
        }
        if(now.getMinutes()>=48){
            url_go = 'https://krasnoyarsk.drom.ru/auto/used/all/';
        }
        if(now.getMinutes()>=52){
            url_go = 'https://petropavlovsk-kamchatskiy.drom.ru/auto/used/all/';
        }
        if(now.getMinutes()>=56){
            url_go = 'https://spb.drom.ru/auto/used/all/';
        }






        // todo: сортируем выдачу
        await PAGE.goto(url_go, { referer: "https://auto.drom.ru/", waitUntil: "domcontentloaded" });
        await PAGE.waitForTimeout(1000);

        // todo: собираем все ссылки с объявлениями
        await PAGE.waitForSelector('[data-ga-stats-name="tabs_group_by_models"]');

        let links = await PAGE.evaluate(() => {
            let col_ln = document.querySelectorAll('[data-ftid="bulls-list_bull"]');
            let prices = document.querySelectorAll('[data-ftid="bulls-list_bull"]');
            let lnk = [];
            let i = 0;
            col_ln.forEach((element) => {
                lnk.push(
                    {href: element.href,
                        price: document.querySelectorAll('[data-ftid="bull_price"]')[i]?.innerText.replace(/( )/g,'')
                    }
                );
            });
            i++;
            return lnk;
        });
        await PAGE.waitForTimeout(1000);
        let uplnk = [];
        for (let j = 0; j <= 19; j++) {
            uplnk.push(links[19-j]);
        }
        let rand = Math.floor(Math.random() * 2);
        if(rand == 0){
            links = uplnk.slice(0);
        }

      
        for (let i = 0; i < 20; i++) {
            console.log(links[i].href);
            console.log('Итерация'+i);
            // todo: проверяем ссылку, если авто новый, то пропускаем
            if(links[i].href.indexOf('cars/new') !== -1) {
                continue;
            }


            // todo: получаем ID объявления
            let link_array = links[i].href.split('/');
            let last_element_array = link_array[link_array.length - 2].split('-');
            let id = link_array[link_array.length - 1].replace('.html','');
            console.log('ИД'+id+links[i].href);


            // todo: проверяем наличие объявления в БД
            let exists = await this.existsInnerId(id, links[i].href, 6);//5 автору
            if(exists !== false){
                const link = links[i].href;
                console.log('Объявление ' + id + ' уже есть в коллекторе (' + exists.id + ')');
                await this.sendUpdateToCollector(exists.id, { price: links[i].price });
                console.log('Обновили данные объявления ' + exists.id + ', ' + links[i].price);
                continue;
            }


            // todo: открываем объявление по ссылке
            console.log('Переходим ' + id + 'i'+ i);
            await PAGE.waitForTimeout(1000);
            if(i>0){
                await PAGE.goto(links[i].href, { waitUntil: "domcontentloaded",  referer: links[i-1].href });
            } else {
                await PAGE.goto(links[i].href, { waitUntil: "domcontentloaded" });
            }
            console.log('Проверка 1');
            await PAGE.waitForTimeout(1000);
            console.log('Проверка 2');
            let pv = await PAGE.evaluate(() => {
                let p;
                p = document.querySelector('[data-ga-stats-name="ownership_periods"]')?.innerText;//Количество владельцев
                return p;
            });
            let err;
            if (pv != 'undefined'){
                //  err = await PAGE.click('[data-ga-stats-name="ownership_periods"]');// кликаем периоды владения
            }

            await PAGE.waitForTimeout(1000);

            // todo: получаем данные автомобиля
            try {
                await PAGE.waitForSelector('.css-pxeubi ');
                await PAGE.waitForTimeout(2000);
                await PAGE.waitForTimeout(500);
                await PAGE.click('.ejipaoe0');
                await PAGE.waitForTimeout(500);
            } catch {

            }

            let car = await PAGE.evaluate(() => {

                console.log('Проверка 1');
                const pause = (async () => {
                    let waitTill =   new Date(new Date().getTime() + 2 * 1000);
                    while(waitTill > new Date()){}
                    return true;
                });

                const lastChildText = (selector) => {
                    try {
                        let collection = document.querySelectorAll(selector);
                        return collection[collection.length - 1]?.innerText;
                    }catch(e){
                        return '';
                    }
                };

                let c = {};
                let string = document.querySelector('[data-drom-module="bull-page"]').getAttribute('data-drom-module-data');
                let arr_main = JSON.parse(string);

                c.city = arr_main.geoInfo[0]?.text;
                c.city = c.city.split(',');
                c.city = c.city[0];
                console.log('Проверка 2');
                pause();

                c.type_price = document.querySelector('.ejipaoe0')?.innerText;
                c.inner_id = 10;//ID объявления
                console.log(c.inner_id);
                c.name = document.querySelector('h1 .css-ik080n')?.innerText;
                console.log(c.name);
                c.description = document.querySelector('.css-1j8ksy7  .css-ik080n')?.innerText;
                console.log(c.description);
                c.price = document.querySelector('.css-10qq2x7')?.innerText.replace(/(\s)/g, '');
                c.price = Number.parseInt(c.price);
                let crumbs = document.querySelectorAll('.e2rnzmt0');
                c.brand = crumbs[2].innerText;
                console.log(c.brand);
                c.model = crumbs[3].innerText;
                console.log(c.model);
                c.generation = document.querySelector('[data-ga-stats-name="generation_link"]')?.innerText;
                if(c.generation === '') c.generation = null;
                console.log(c.generation);
                c.year = document.querySelector('h1 .css-ik080n')?.innerText;
                c.vin = document.querySelector('.css-quljm6')?.innerText;
                console.log(c.vin);
                //parseInt(str.replace(/[^\d]/g, ''))
                c.year = c.year.replace(/[^\d]/g, '');
                let year = Number.parseInt(c.year.toString().slice(-4));
                c.year = year;
                console.log(c.year);

                let props = document.querySelectorAll('.css-7whdrf');
                console.log('Пробег');
                c.mileage = Number.parseInt(props[6]?.innerText.replace(' ',''));
                if(c.mileage === '')  c.mileage = null;
                console.log(c.mileage);

                c.views = document.querySelector('.css-14wh0pm')?.innerText;
                c.views = Number.parseInt(c.views);
                console.log(c.views);
                let allnames = document.querySelectorAll('.ezjvm5n0');

                if(c.vin!=''){
                    c.timehave = document.querySelector('.espqro32')?.innerText; //Время владения
                }
                c.add = document.querySelector('.css-pxeubi')?.innerText; //Дата добавления объявления
                c.countphoto = document.querySelectorAll('.css-1p5zfo6');//css-1f4se8o количество фото в объявлении
                c.trpts = document.querySelector('[data-ga-stats-name="characteristics"]')?.innerText;
                c.countphoto = c.countphoto.length;
                c.site_price = document.querySelector('.ew7553b1 .css-159lyxl')?.innerText.replace(' ','');  //оценка сайта
                if(c.site_price === undefined){
                    console.log('не берем прайс');
                    c.site_price = 0;
                } else {
                    pause();
                    c.site_price =  c.site_price.replace(' ','');  //оценка сайта
                    console.log(c.site_price);
                    pause();
                    c.site_price =  c.site_price.replace(' ','');  //оценка сайта
                    console.log(c.site_price);
                }

                let pos = 0;
                allnames.forEach((element) => {
                    if(element){
                        console.log(element);
                        //c.vin = element.payload.frameNumber;
                        if(element?.innerHTML.indexOf('Двигатель') != -1){
                            console.log('Найден двигатель');
                            console.log(props[pos]?.innerText);
                            c.engine_fuel = props[pos]?.innerText.split(',')[0].trim();
                            c.engine_capacity = props[pos]?.innerText.split(',')[1].trim();
                            c.engine_capacity = Number.parseFloat(c.engine_capacity);
                        }
                        if(element?.innerHTML.indexOf('Мощность') != -1){
                            console.log('Найдена мощность');
                            console.log(props[pos]?.innerText);
                            c.engine_displacement = props[pos]?.innerText.split(',')[0].trim();
                            c.engine_displacement = Number.parseInt(c.engine_displacement);
                        }
                        if(element?.innerHTML.indexOf('Коробка передач') != -1){
                            c.transmission = props[pos]?.innerText;
                            console.log(c.transmission);
                        }
                        if(element?.innerHTML.indexOf('Тип кузова') != -1){
                            c.body = props[pos]?.innerText;
                            console.log(c.body);
                            console.log('Тип кузова');
                        }
                        if(element?.innerHTML.indexOf('Цвет') != -1){
                            c.color = props[pos]?.innerText;
                            console.log(c.color);
                        }
                        if(element?.innerHTML.indexOf('Пробег') != -1){
                            c.mileage = Number.parseInt(props[pos]?.innerText.replace(' ',''));
                            if(c.mileage === '')  c.mileage = null;
                            console.log(c.mileage);
                        }
                        if(element?.innerHTML.indexOf('Руль') != -1){
                            c.wheel = props[pos]?.innerText;
                            console.log('Руль');
                        }
                        if(element?.innerHTML.indexOf('Привод') != -1){
                            c.drive = props[pos]?.innerText;
                            console.log(c.drive);
                        }
                        c.complectation_name = "отсутсвует";
                        if(element?.innerHTML.indexOf('Комплектация') != -1){
                            c.complectation_name = props[pos]?.innerText;
                            c.complectation_url = props[pos]?.innerHTML;
                            c.complectation_url = c.complectation_url?.split('"')[1];
                        }
                    }
                    pos++;
                    console.log(pos);
                })

                return c;
            });
            console.log('Проверка 8');
            car.inner_id = id;
            //car.pts_id = 1;
            car.fuel = car.engine_fuel;
            let temp = car.engine_capacity;
            car.engine_capacity = car.engine_displacement;
            car.engine_displacement = temp;
            car.bodytype =  car.body;
            if(!car.trpts){
                car.trpts = null;
            }
            if(car.trpts == 'Характеристики совпадают с ПТС'){
                car.pts_true = 1;
            }
            car.drive =  car.drive.trim();
            car.drive =  car.drive.trim();
            car.color = car.color.trim();
            car.fuel = car.fuel.trim();
            car.vin = car.vin.trim();
            car.transmission = car.transmission.trim();
            console.log('Получили данные объявления ' + id + ', ' +car.countphoto + ', ' + car.body+ ', ' + car.generation + ', ' + car.year);

            car.used = 1;//Б/У автомобиль
            car.seller_name = null;
            car.seller_phone = null;
            await PAGE.waitForTimeout(1000);
            //  await PAGE.mouse.click(50, 150);
            console.log('Получили данные владельца ' + car.seller_phone + ', ' + car.seller_name);

            // todo: получаем координаты
            try {
                await PAGE.waitForSelector('.Link.CardSellerNamePlace__place');
                await PAGE.hover('.Link.CardSellerNamePlace__place');
                await PAGE.waitForTimeout(500);
                await PAGE.click('.Link.CardSellerNamePlace__place');
                await PAGE.waitForSelector('.SellerPopupFooter__taxiButton');
                let coords = await PAGE.evaluate(() => {
                    try {
                        let coords = {latitude: 0, longitude: 0};
                        let href = document.querySelector('.SellerPopupFooter__taxiButton')?.getAttribute('href');
                        if(href){
                            let url = new URL(href);
                            coords.latitude = url.searchParams.get('end-lat');
                            coords.longitude = url.searchParams.get('end-lon');
                        }
                        return coords;
                    } catch {
                        return {latitude: 0, longitude: 0};
                    }
                });
                car.latitude = coords.latitude;
                car.longitude = coords.longitude;
            } catch {
                car.latitude = null;
                car.longitude = null;
            }
            await PAGE.waitForTimeout(1000);
            //await PAGE.mouse.click(50, 150);
            console.log('Получили координаты ' + car.latitude + ', ' + car.longitude);


            // todo: добавляем мета-данные
            car.url = links[i].href;
            car.resource = 'drom.ru';


            // todo: сохранем данные в коллекторе
            car.bad_field = "no bug";
            function isString(value) {
                return typeof value === 'string' || value instanceof String;
            }
            console.log(Number.isInteger(car.price));
            if(Number.isInteger(car.price) === false)
            {
                console.log('invalid field price');
                car.bad_field = "price";
            }
            if(isString(car.seller_phone) === false){
                console.log('invalid field seller_phone');
                car.bad_field = "seller_phone";
            }
            if(isString(car.seller_name) === false){
                console.log('invalid field seller_name');
                car.bad_field = "seller_name";
            }
            if(Number.isInteger(car.views) === false){
                console.log('invalid field views');
                car.bad_field = "views";
            }
            if(car.address === undefined){
                car.address = 'Не указан';
            }
            if((isString(car.address) === false) || (undefined === car.address)){
                console.log('invalid field address');
                car.bad_field = "address";
            }
            if(isString(car.url) === false){
                console.log('invalid field url');
                car.bad_field = "url";
            }
            if(isString(car.advantage) === false){
                console.log('invalid field advantage');
                car.bad_field = "advantage";
            }
            if(Number.isInteger(car.flaw) === false){
                console.log('invalid field flaw');
                car.bad_field = "flaw";
            }
            console.log(car);
            await this.sendToCollector(car);
            await PAGE.waitForTimeout(300);
            console.log('Сохранено объявление ' + car.inner_id);


            // todo: возвращаемся к списку объявлений
            //await PAGE.goBack();
            await PAGE.waitForTimeout(2000);
            console.log('Возвращаемся к списку объявлений');
        }

        /*****************************************************************/


        // todo: сохраняем результат и перезапускаем сценарий
        console.log('Перезапускаем сценарий...');
        await this.cookie.save(pages[0]);
        return true;
    };
}
