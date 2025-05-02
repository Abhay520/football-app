import { Page } from "puppeteer";
import { Browser, HTTPRequest } from "puppeteer";

export const interceptPageRequest = (req : HTTPRequest) => {
    if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
        req.abort();
    }
    else {
        req.continue();
    }
}

export const createNewPage = async(browser : Browser) : Promise<Page> => {
    let page = await browser.newPage(); 
    await page.setRequestInterception(true);
    page.on('request', (req) => interceptPageRequest(req))
    page.setDefaultNavigationTimeout(0);
    return page
}