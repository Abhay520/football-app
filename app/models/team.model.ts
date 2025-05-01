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

        result += this.getGoodStats(Stat.GoalsScored, venue)
        result += this.getGoodStats(Stat.GoalsConceded, venue)
        result += this.getGoodStats(Stat.Shots, venue)
        result += this.getGoodStats(Stat.ShotsOnTarget, venue)
        result += this.getGoodStats(Stat.OpponentShots, venue)
        result += this.getGoodStats(Stat.OpponentShotsOnTarget, venue)
        result += this.getGoodStats(Stat.Corners, venue)
        result += this.getGoodStats(Stat.OpponentCorners, venue)
        result += this.getGoodStats(Stat.Cards, venue)
        result += this.getGoodStats(Stat.OpponentCards, venue)
        result += this.getGoodStats(Stat.TotalGoals, venue)
        result += this.getGoodStats(Stat.TotalCorners, venue)

        result += `% of matches with more cards is ${this.averageCardsPercentages()[0]}\n`
        result += `% of matches with more cards in the last 10 matches is ${this.averageCardsPercentages(undefined, 10)[0]}\n`
        result += `% of matches with more cards in the last 5 matches ${venue} is ${this.averageCardsPercentages(venue, 5)[0]}\n`

        result += `% of matches with more corners is ${this.averageCornersPercentages()[0]}\n`
        result += `% of matches with more corners in the last 10 matches is ${this.averageCornersPercentages(undefined, 10)[0]}\n`
        result += `% of matches with more corners in the last 5 matches  ${venue} is ${this.averageCornersPercentages(venue, 5)[0]}\n`

        result += this.goalStats

        result += this.bothStats

        return result;
    }

    get goalStats() : string {
        let result = "\n"
        result +=  `%ov1.5 is ${this.percentageGoalsOver(1.5)[0]}\n`
        result +=  `%ov2.5 is ${this.percentageGoalsOver(2.5)[0]}\n`
        result +=  `%ov1.5 at home last 20 is ${this.percentageGoalsOver(1.5, "Home", 20)[0]}\n`
        result +=  `%ov1.5 away last 20  is ${this.percentageGoalsOver(1.5, "Away", 20)[0]}\n`
        result +=  `%ov2.5 at home last 20 is ${this.percentageGoalsOver(2.5, "Home", 20)[0]}\n`
        result +=  `%ov2.5 away last 20  is ${this.percentageGoalsOver(2.5, "Away", 20)[0]}\n`
        return result;
    }

    private getStats(stat : Stat, venue : string) : string {
        let result = "\n"
        
        result +=`avg ${Stat[stat]} is ${this.calculateStats(stat)[0]}\n`
        result +=`% variance ${Stat[stat]} is ${this.calculateStats(stat)[1]}%\n`
        result +=`avg ${Stat[stat]} last 10 is ${this.calculateStats(stat, undefined, 10)[0]}\n`
        result +=`% variance ${Stat[stat]} last 10 is ${this.calculateStats(stat, undefined, 10)[1]}%\n`
        result +=`avg ${Stat[stat]} ${venue} is ${this.calculateStats(stat, venue)[0]}\n`
        result +=`% variance ${Stat[stat]} ${venue} is ${this.calculateStats(stat, venue)[1]}%\n`
        result +=`avg ${Stat[stat]} ${venue} last 5 is ${this.calculateStats(stat, venue, 5)[0]}\n`
        result +=`% variance ${Stat[stat]} ${venue} last 5 is ${this.calculateStats(stat, venue, 5)[1]}%\n`
        return result;
    }

    private getGoodStats(stat : Stat, venue : string) : string {
        let result = ""
        let variance = this.calculateStats(stat)[1]
        if(variance < 70){
            result +=`avg ${stat} is ${this.calculateStats(stat)[0]}\n`
            result +=`% variance ${stat} is ${variance}%\n`
        }
        variance = this.calculateStats(stat, undefined, 10)[1]
        if(variance < 70){
            result +=`avg ${stat} last 10 is ${this.calculateStats(stat, undefined, 10)[0]}\n`
            result +=`% variance ${stat} last 10 is ${variance}%\n`
        }
        variance = this.calculateStats(stat, venue)[1]
        if(variance < 70){
            result +=`avg ${stat} ${venue} is ${this.calculateStats(stat, venue)[0]}\n`
            result +=`% variance ${stat} ${venue} is ${variance}%\n`
        }
        variance = this.calculateStats(stat, venue, 5)[1]
        if(variance < 70){
            result +=`avg ${stat} ${venue} last 5 is ${this.calculateStats(stat, venue, 5)[0]}\n`
        result +=`% variance ${stat} ${venue} last 5 is ${variance}%\n`
        }
        return result;
    }

    get bothStats() : string {
        let result = "\n"
        result +=  `%btts is ${this.percentageBTTS()}\n`
        result +=  `%btts at home last 20 is ${this.percentageBTTS("Home", 20)}\n`
        result +=  `%btts away last 20  is ${this.percentageBTTS("Away", 20)}\n`
        result +=  `%both cards is ${this.percentageBothCards()}\n`
        result +=  `%both cards at home last 20 is ${this.percentageBothCards("Home", 20)}\n`
        result +=  `%both cards away last 20  is ${this.percentageBothCards("Away", 20)}\n`
        return result;
    }

    get completeMatches() : number {
        let completeMatches = 0;
        for(let i  = 0; i < this.matches.length; i++){
            if(this.matches[i].isComplete)completeMatches++
        }
        return completeMatches
    }

    private calculateStats(statBeingCalculated : Stat, venue? : string, recentMatches? : number) : number[] {
        let dataArray = getMatchStatArray(this.matches, statBeingCalculated, venue, recentMatches)
        let mean = calculateMean(dataArray)
        let variance = calculateVariancePercentage(dataArray)
        return [mean, variance]
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