import { Match } from "../models/match.model"

export enum Stat {
    GoalsScored = "gf",
    GoalsConceded = "ga",
    Shots = "shots",
    ShotsOnTarget = "shots on target",
    OpponentShots = "opponent shots",
    OpponentShotsOnTarget = "opponent shots on target",
    Corners = "corners",
    OpponentCorners = "opponent corners",
    Cards = "cards",
    OpponentCards = "opponent cards",
    TotalGoals = "total goals",
    TotalCorners = "total corners"
}

export const addMatchStats = (match : Match, matchStats : string[][]) => {
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
    else if(!foundCorners){
        console.log("Match Stats does not have corners")
        console.log("Here is the link and the stats " + match.matchReportLink)
        console.log(matchStats)
    }
    else if(!foundCards){
        console.log("Match Stats does not have cards")
        console.log("Here is the link and the stats " + match.matchReportLink)
        console.log(matchStats)
    }
}

export const matchAlreadyPlayed = (date : Date) : boolean => {
    let difference = new Date().getTime() - date.getTime()
    return difference > 0
}

export const convertStat = (match : Match, stat : Stat) : number | undefined => {
    switch(stat){
        case Stat.GoalsScored : return match.gf;
        case Stat.GoalsConceded : return match.ga;
        case Stat.Shots : return match.shots;
        case Stat.ShotsOnTarget : return match.shotsOnTarget;
        case Stat.OpponentShots : return match.opponentShots;
        case Stat.OpponentShotsOnTarget: return match.opponentShotsOnTarget;
        case Stat.Corners : return match.corners
        case Stat.OpponentCorners: return match.opponentCorners;
        case Stat.Cards : return match.cards
        case Stat.OpponentCards : return match.opponentCards
        case Stat.TotalCorners : return match.corners + match.opponentCorners
        case Stat.TotalGoals : return match.gf + match.ga
        default : return undefined;
    }
}

export const getMatchStatArray = (matches : Match[], statBeingCalculated : Stat, venue? : string, recentMatches? : number) : number[] => {
    let data : number[] = [];
    let numberOfMatchesCovered = 0;
    for(let i = matches.length -1; i >= 0; i--){
        let match = matches[i]
        let stat = convertStat(match, statBeingCalculated)
        if(typeof(stat) === "number"){
            if(!venue || match.venue == venue)  {
                data.push(stat);
                numberOfMatchesCovered++
            }
        }
        if(numberOfMatchesCovered == recentMatches)break
    }
    return data;
}

