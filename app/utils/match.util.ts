import { Match } from "../models/match.model"

export enum Stat {
    GoalsScored,
    GoalsConceded,
    Shots,
    ShotsOnTarget,
    OpponentShots,
    OpponentShotsOnTarget,
    Corners,
    OpponentCorners,
    Cards,
    OpponentCards,
    TotalGoals,
    TotalCorners
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
        if(stat == undefined){
            console.log("Invalid stat in match : ")
            console.log(match)
            continue;
        }
        if(!venue || match.venue == venue)  {
            data.push(stat);
            numberOfMatchesCovered++
        }
        if(numberOfMatchesCovered == recentMatches)break
    }
    return data;
}

