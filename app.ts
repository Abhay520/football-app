import puppeteer, { Browser, Page} from 'puppeteer'
import { Match } from './app/models/match.model';
import { Team } from './app/models/team.model';
import { matchAlreadyPlayed } from './app/utils/match.util';
import { createNewPage } from './app/utils/page.util';

const getMatchFromPage = async(page : Page, pageLink : string) => {
    await page.goto(pageLink, { waitUntil: 'domcontentloaded' })
    return await page.evaluate(async() => {
        const rows = Array.from(document.querySelectorAll('#team_stats table tbody tr'))
        return Array.from(rows, row => {
            const headers = row.querySelectorAll('th')
            let headerArray = Array.from(headers, header => header.innerText);

            let columnArray : string[];

            //change the array for cards column
            let cardsColumn = row.querySelectorAll('td .cards')
            if(cardsColumn.length != 0){
                columnArray = Array.from(cardsColumn, card => {
                    if(card)return card.children.length.toString()
                    else return ""
                })
            }
            else{
                const columns = row.querySelectorAll('td');
                columnArray = Array.from(columns, column => column.innerText);
            }
            if(headers){
                const newArray = headerArray.concat(columnArray)
                return newArray
            }
            else return columnArray;
        });
    }).then(async(matchInfo) => {
        //console.log(matchInfo)
        await page.$$eval("#team_stats_extra", divs => divs.map(div => (div as HTMLElement).innerText))
            .then((extraStats) => {
                if(extraStats[0])matchInfo = matchInfo.concat(extraStats[0].split("\n"))
            })
        //console.log(matchInfo)
        return matchInfo;
    })
}

const getAllMatchesFromPage = async(page : Page) => {
    return await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#matchlogs_for tbody tr'))
        return Array.from(rows, row => {
            let header = row.querySelector('th') as HTMLElement
            let headerLink = row.querySelector('th a') as HTMLAnchorElement
            let headerArray : string[] = []
            if(!headerLink)
                headerArray = [header.innerText, ""]
            else 
                headerArray = [header.innerText, headerLink.href]
            const columns = row.querySelectorAll('td')
            let columnArray = Array.from(columns, column => column.innerText);
            if(header) 
                return headerArray.concat(columnArray)
            else 
                return columnArray;
        });
    })
}

const addMatchStats = (match : Match, matchStats : string[][]) => {
    let foundShots = false; let foundCorners = false;let foundCards = false;
    for(let i = 0; i < matchStats.length;i++){
        if(matchStats[i].toString() === "Shots on Target"){
            foundShots = true;
            let homeShotArray = matchStats[i+1][0].split(/[\s-]+/)
            let awayShotArray = matchStats[i+1][1].split(/[\s-]+/)
            match.setShots(homeShotArray[2], homeShotArray[0], 
                awayShotArray[4], awayShotArray[2])
        }
        else if(matchStats[i].toString() === "Cards"){
            foundCards = true;
            let homeCards = matchStats[i+1][0].toString()
            let awayCards = matchStats[i+1][1].toString()
            match.setCards(homeCards, awayCards)
        }
        else if(matchStats[i].toString() === "Corners"){
            foundCorners = true;
            let homeCorners = matchStats[i-1].toString()
            let awayCorners = matchStats[i+1].toString()
            match.setCorners(homeCorners, awayCorners)
        }
    }

    if(!foundShots){
        console.log("Match Stats does not have shots on target")
        console.log("Here is the link and the stats " + match.matchReportLink)
        console.log(matchStats)
    }

    if(!foundCorners){
        console.log("Match Stats does not have corners")
        console.log("Here is the link and the stats " + match.matchReportLink)
        console.log(matchStats)
    }

    if(!foundCards){
        console.log("Match Stats does not have cards")
        console.log("Here is the link and the stats " + match.matchReportLink)
        console.log(matchStats)
    }
}

const createMatch = async(browser : Browser, matchInfo : string[]) : Promise<Match | null> => {
    //add only matches that have not been played yet
    const matchDate = new Date(matchInfo[0])
    if(matchAlreadyPlayed(matchDate)){
        let match  = new Match(matchDate, matchInfo[3], matchInfo[10], Number(matchInfo[8]), 
                            Number(matchInfo[9]), matchInfo[6], matchInfo[1])

        if(match.matchReportLink){
            let newPage = await createNewPage(browser)
            await getMatchFromPage(newPage, match.matchReportLink).then(matchStats => {
                addMatchStats(match, matchStats)
                newPage.close()
            })
            return match
        }
        else{
            console.log("No link available for the following match")
            console.log(match)
        }
    }
    
    return null
}

async function parseTeamInfo(pageLink : string, browser : Browser) : Promise<Team>{
    // Open a new tab
    let mainPage = await createNewPage(browser)
    // Visit the page and wait until network connections are completed
    await mainPage.goto(pageLink, { waitUntil: 'networkidle0' });

    let url = mainPage.url()
    let teamName = url.substring((url.lastIndexOf('/') + 1))

    let matches : Match[] = new Array

    await getAllMatchesFromPage(mainPage).then(async matchInfo => {

        for(let i = 0; i < matchInfo.length; i++){
            //setting timeout to prevent too many requests
            await new Promise(r => setTimeout(r, 3000));
            let matchCreated =  await createMatch(browser, matchInfo[i])
            if(matchCreated != null) {
                matches.push(matchCreated)
            }
        }

        await mainPage.close()
    })
    
    return new Team(teamName, matches)
}

const getTeamsPlayingToday = async(browser : Browser) : Promise<string[][]> => {

    let newPage = await createNewPage(browser)

    await newPage.goto("https://fbref.com/en/matches/", { waitUntil: 'domcontentloaded' })

    return await newPage.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('.stats_table tbody tr'))
        return Array.from(rows, row => {
            const columns = row.querySelectorAll('td a') as NodeList
            let matchArray : string[] = []
            Array.from(columns, (column)  => {
                let anchor = column as HTMLAnchorElement
                if(anchor.href.startsWith("https://fbref.com/en/squads")){
                    matchArray.push(anchor.href)
                }
                return anchor.href
            });
            return matchArray;
        });
    }).then(async result => {
        await newPage.close()
        return result
    })
}

const main = async() => {
    
    const browser = await puppeteer.launch({ headless: false });

    await getTeamsPlayingToday(browser).then(async(result) => {
        for(let i = 0; i < result.length; i++){
            await parseTeamInfo(result[i][0], browser).then((team) => {
                console.log(team.stats("Home"))
            })
            await parseTeamInfo(result[i][1], browser).then((team) => {
                console.log(team.stats("Away"))
            })
        }
    })

    // Don't forget to close the browser instance to clean up the memory
    await browser.close().then(() => {console.log("Browser closed");});
}

await main()









