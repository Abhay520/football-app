import { convertStat, getMatchStatArray, Stat } from "../utils/match.util.ts"
import { calculateMean, calculateVariancePercentage } from "../utils/math.util.ts"
import {Match} from "./match.model.ts"

export class Team{
    name : string
    matches : Match[]

    constructor(name : string, matches : Match[]){
        this.name = name
        this.matches = matches
    }

    public stats(venue : string) : string {

        let result : string = "";
         
        result +=`Number of complete matches covered is ${this.completeMatches}\n`
        result +=`Team name is ${this.name}\n\n`

        result += `Team is playing at ${venue}`

        result += this.goodStats(venue)

        result += this.cardPercentageStats(venue)

        result += this.cornerPercentageStats(venue)

        result += this.goalStats(venue)

        result += this.bothStats(venue)

        return result;
    }

    private goalStats(venue? : string) : string {
        let result = "\n"
        result +=  `%ov1.5 is ${this.percentageGoalsOver(1.5)[0]}\n`
        result +=  `%ov2.5 is ${this.percentageGoalsOver(2.5)[0]}\n`
        result +=  `%ov1.5 ${venue} last 10 is ${this.percentageGoalsOver(1.5, venue, 10)[0]}\n`
        result +=  `%ov2.5 ${venue} last 10 is ${this.percentageGoalsOver(2.5, venue, 10)[0]}\n`
        return result;
    }

    private bothStats(venue : string) : string {
        let result = "\n"
        result +=  `%btts is ${this.percentageBTTS()}\n`
        result +=  `%btts ${venue} last 10 is ${this.percentageBTTS(venue, 10)}\n`
        result +=  `%both cards is ${this.percentageBothCards()}\n`
        result +=  `%both cards ${venue} last 10 is ${this.percentageBothCards(venue, 10)}\n`
        return result;
    }

    private completeStats(stat : Stat, venue : string) : string {
        let result = "\n"
        result +=`avg ${Stat[stat]} is ${this.calculateStat(stat)[0]}\n`
        result +=`% variance ${Stat[stat]} is ${this.calculateStat(stat)[1]}%\n`
        result +=`avg ${Stat[stat]} last 10 is ${this.calculateStat(stat, undefined, 10)[0]}\n`
        result +=`% variance ${Stat[stat]} last 10 is ${this.calculateStat(stat, undefined, 10)[1]}%\n`
        result +=`avg ${Stat[stat]} ${venue} is ${this.calculateStat(stat, venue)[0]}\n`
        result +=`% variance ${Stat[stat]} ${venue} is ${this.calculateStat(stat, venue)[1]}%\n`
        result +=`avg ${Stat[stat]} ${venue} last 5 is ${this.calculateStat(stat, venue, 5)[0]}\n`
        result +=`% variance ${Stat[stat]} ${venue} last 5 is ${this.calculateStat(stat, venue, 5)[1]}%\n`
        return result;
    }

    private goodStats(venue : string) : string {
        let result = "\n\n"
        result += this.goodStat(Stat.GoalsScored, venue)
        result += this.goodStat(Stat.GoalsConceded, venue)
        result += this.goodStat(Stat.Shots, venue)
        result += this.goodStat(Stat.ShotsOnTarget, venue)
        result += this.goodStat(Stat.OpponentShots, venue)
        result += this.goodStat(Stat.OpponentShotsOnTarget, venue)
        result += this.goodStat(Stat.Corners, venue)
        result += this.goodStat(Stat.OpponentCorners, venue)
        result += this.goodStat(Stat.Cards, venue)
        result += this.goodStat(Stat.OpponentCards, venue)
        result += this.goodStat(Stat.TotalGoals, venue)
        result += this.goodStat(Stat.TotalCorners, venue)
        return result;
    }

    private goodStat(stat : Stat, venue : string) : string {
        let result = ""
        let statResult = this.getGoodStat(stat)
        if(statResult != null) result += statResult
        statResult = this.getGoodStat(stat, undefined, 15)
        if(statResult != null) result += statResult
        statResult = this.getGoodStat(stat, venue)
        if(statResult != null) result += statResult
        statResult = this.getGoodStat(stat, venue, 10)
        if(statResult != null) result += statResult
        return result;
    }

    private cardPercentageStats(venue : string) : string {
        let result = "\n"
        result += `% of matches with more cards is ${this.averageCardsPercentages()[0]}\n`
        result += `% of matches with more cards in the last 10 matches is ${this.averageCardsPercentages(undefined, 10)[0]}\n`
        result += `% of matches with more cards in the last 5 matches ${venue} is ${this.averageCardsPercentages(venue, 5)[0]}\n`
        return result;
    }

    private cornerPercentageStats(venue : string) : string {
        let result = "\n"
        result += `% of matches with more corners is ${this.averageCornersPercentages()[0]}\n`
        result += `% of matches with more corners in the last 10 matches is ${this.averageCornersPercentages(undefined, 10)[0]}\n`
        result += `% of matches with more corners in the last 5 matches  ${venue} is ${this.averageCornersPercentages(venue, 5)[0]}\n`
        return result;
    }

    get completeMatches() : number {
        let completeMatches = 0;
        for(let i  = 0; i < this.matches.length; i++){
            if(this.matches[i].isComplete)completeMatches++
        }
        return completeMatches
    }

    private calculateStat(statBeingCalculated : Stat, venue? : string, recentMatches? : number) : number[] {
        let dataArray = getMatchStatArray(this.matches, statBeingCalculated, venue, recentMatches)
        let mean = calculateMean(dataArray)
        let variance = calculateVariancePercentage(dataArray)
        return [mean, variance]
    }

    private getGoodStat(stat : Stat, venue? : string, recentMatches? : number) : string | null {
        let result = ""
        let avg = this.calculateStat(stat, venue, recentMatches)[0]
        let variance = this.calculateStat(stat, venue, recentMatches)[1]
        if(variance < 70){
            if(venue == undefined){
                if(recentMatches == undefined){
                    result +=`avg ${stat} is ${avg}\n`
                    result +=`% variance ${stat} is ${variance}%\n`
                }
                else{
                    result +=`avg ${stat} last ${recentMatches} is ${avg}\n`
                    result +=`% variance ${stat} last ${recentMatches} is ${variance}%\n`
                }
            }
            else{
                if(recentMatches == undefined){
                    result +=`avg ${stat} ${venue} is ${avg}\n`
                    result +=`% variance ${stat} ${venue} is ${variance}%\n`
                }
                else{
                    result +=`avg ${stat} ${venue} last ${recentMatches} is ${avg}\n`
                    result +=`% variance ${stat} ${venue} last ${recentMatches} is ${variance}%\n`
                }
            }
            return result;
        }
        else return null;
    }


    private averageGF(venue? : string, recentMatches? : number) : number {
        let totalGF = 0;
        let numberOfMatchesCovered = 0;
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.gf != undefined && (!venue || match.venue == venue)) {
                totalGF += match.gf
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return Number((totalGF/numberOfMatchesCovered).toFixed(2));
    }

    private averageGA(venue? : string, recentMatches? : number) : number {
        if(recentMatches!= undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let totalGA = 0;
        let numberOfMatchesCovered = 0;
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.ga != undefined && (!venue || match.venue == venue)) {
                totalGA += match.ga
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return Number((totalGA/numberOfMatchesCovered).toFixed(2));
    }

    private percentageGoalsOver(goals : number, venue? : string, recentMatches? : number) : number[]{
        if(recentMatches!= undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let moreGoals = 0; let lessGoals  = 0;
        let numberOfMatchesCovered = 0
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.gf != undefined && match.ga != undefined && (!venue || match.venue == venue)) {
                let totalGoals = match.gf + match.ga;
                if(totalGoals > goals) moreGoals++
                else lessGoals++
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return [Number((moreGoals/numberOfMatchesCovered * 100).toFixed(2)),
            Number((lessGoals/numberOfMatchesCovered * 100).toFixed(2))
        ];
    }

    private percentageBTTS(venue? : string, recentMatches? : number) : number{
        if(recentMatches!= undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let bothTeamsScored = 0;
        let numberOfMatchesCovered = 0
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.gf != undefined && match.ga != undefined && (!venue || match.venue == venue)) {
                if(match.gf > 0 && match.ga > 0) {bothTeamsScored++}
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return Number((bothTeamsScored/numberOfMatchesCovered * 100).toFixed(2))
    }

    private percentageBothCards(venue? : string, recentMatches? : number) : number{
        if(recentMatches!= undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let bothTeamsCards = 0;
        let numberOfMatchesCovered = 0
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.cards != undefined && match.opponentCards != undefined && (!venue || match.venue == venue)) {
                if(match.cards > 0 && match.opponentCards > 0) bothTeamsCards++
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return Number((bothTeamsCards/numberOfMatchesCovered * 100).toFixed(2))
    }

    private averageShotsOnTarget(recentMatches? : number) : number {
        if(recentMatches!= undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let totalNumberOfShotsOnTarget = 0;
        let numberOfMatchesCovered = 0;
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.shotsOnTarget!= undefined) {
                totalNumberOfShotsOnTarget += match.shotsOnTarget
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return Number((totalNumberOfShotsOnTarget/numberOfMatchesCovered).toFixed(2));
    }

    private averageShotsOnTargetPercentages(venue? : string, recentMatches? : number) : number[] {
        if(recentMatches!= undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let moreShotsOnTarget = 0; let equalShotsOnTarget  = 0; let lessShotsOnTarget  = 0;
        let numberOfMatchesCovered = 0
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.shotsOnTarget != undefined && match.opponentShotsOnTarget != undefined && (!venue || match.venue == venue)) {
                if(match.shotsOnTarget > match.opponentShotsOnTarget) moreShotsOnTarget++
                if(match.shotsOnTarget == match.opponentShotsOnTarget) equalShotsOnTarget++
                else lessShotsOnTarget++
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return [Number((moreShotsOnTarget/numberOfMatchesCovered * 100).toFixed(2)),
            Number((equalShotsOnTarget/numberOfMatchesCovered * 100).toFixed(2)), 
            Number((lessShotsOnTarget/numberOfMatchesCovered * 100).toFixed(2))
        ];
    }

    get averageShotAccuracy() : number {
        return Number((this.averageGF()/this.averageShotsOnTarget()).toFixed(2));
    }

    get averageShotAccuracyHome() : number {
        return Number((this.averageGF("Home")/this.averageShotsOnTarget()).toFixed(2));
    }

    get averageShotAccuracyAway() : number {
        return Number((this.averageGF("Away")/this.averageShotsOnTarget()).toFixed(2));
    }

    private averageCorners(venue? : string, recentMatches? : number) : number {
        if(recentMatches != undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let totalCorners = 0
        let numberOfMatchesCovered = 0
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.corners != undefined && (!venue || match.venue == venue)) {
                totalCorners += match.corners
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return Number((totalCorners/numberOfMatchesCovered).toFixed(2));
    }

    private averageCornersConceded(venue? : string, recentMatches? : number) : number {
        if(recentMatches != undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let totalCorners = 0
        let numberOfMatchesCovered = 0
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.opponentCorners != undefined && (!venue || match.venue == venue)) {
                totalCorners += match.opponentCorners
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return Number((totalCorners/numberOfMatchesCovered).toFixed(2));
    }

    private averageCornersPercentages(venue? : string, recentMatches? : number) : number[] {
        if(recentMatches != undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let moreCorners = 0; let equalCorners  = 0; let lessCorners  = 0;
        let numberOfMatchesCovered = 0
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.corners != undefined && match.opponentCorners != undefined && (!venue || match.venue == venue)) {
                if(match.corners > match.opponentCorners) moreCorners++
                if(match.corners == match.opponentCorners) equalCorners++
                else lessCorners++
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return [Number((moreCorners/numberOfMatchesCovered * 100).toFixed(2)),
            Number((equalCorners/numberOfMatchesCovered * 100).toFixed(2)), 
            Number((lessCorners/numberOfMatchesCovered * 100).toFixed(2))
        ];
    }

    private averageCards(venue? : string, recentMatches? : number) : number {
        if(recentMatches != undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let totalCards = 0
        let numberOfMatchesCovered = 0
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.cards != undefined && (!venue || match.venue == venue)) {
                totalCards += match.cards
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return Number((totalCards/numberOfMatchesCovered).toFixed(2));
    }

    private averageCardsOpponent(venue? : string, recentMatches? : number) : number {
        if(recentMatches!= undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let totalCards = 0
        let numberOfMatchesCovered = 0
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.opponentCards != undefined && (!venue || match.venue == venue)) {
                totalCards += match.opponentCards
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
            
        }
        return Number((totalCards/numberOfMatchesCovered).toFixed(2));
    }

    private averageCardsPercentages(venue? : string, recentMatches? : number) : number[] {
        if(recentMatches != undefined){
            if(recentMatches > this.completeMatches) recentMatches = this.completeMatches
        }
        let moreCards = 0; let equalCards  = 0; let lessCards  = 0;
        let numberOfMatchesCovered = 0
        for(let i = this.matches.length - 1; i >= 0; i--){
            let match = this.matches[i]
            if(match.cards != undefined && match.opponentCards != undefined && (!venue || match.venue == venue)) {
                if(match.cards > match.opponentCards) moreCards++
                if(match.cards == match.opponentCards) equalCards++
                else lessCards++
                numberOfMatchesCovered++
            }
            if(numberOfMatchesCovered == recentMatches)break
        }
        return [Number((moreCards/numberOfMatchesCovered * 100).toFixed(2)),
            Number((equalCards/numberOfMatchesCovered * 100).toFixed(2)), 
            Number((lessCards/numberOfMatchesCovered * 100).toFixed(2))
        ];
    }

}