export class Match{
    date : Date;
    competition : string;
    opponentName : string;
    gf : number; ga : number; xg : number; xga : number;
    venue : string;
    starting : Player[]; bench : Player[]
    startingOpponent : Player[]; benchOpponent : Player[]
    shotsOnTarget : number; shots : number;
    opponentShotsOnTarget : number; opponentShots : number;
    corners : number; opponentCorners : number;
    cards : number; opponentCards : number;
    matchReportLink : string

    constructor(date : Date, competition : string, 
        opponentName : string, gf : number, ga : number, venue : string, matchReportLink : string) {
        this.date = date
        this.competition = competition
        this.opponentName = opponentName
        this.gf = gf;
        this.ga = ga;
        this.venue = venue;
        this.matchReportLink = matchReportLink
    }

    get isComplete() : boolean {
        if(this.date != undefined  && this.competition != undefined  && this.opponentName != undefined  
            && this.gf != undefined && this.ga != undefined && this.venue != undefined && 
            this.matchReportLink != undefined  && this.shotsOnTarget != undefined  && 
            this.shots != undefined && this.corners != undefined  && 
            this.opponentCorners != undefined  && this.cards != undefined && this.opponentCards != undefined  && 
            this.opponentShots != undefined  && this.opponentShotsOnTarget != undefined){
                return true
        }
        else return false
    } 

    setShots = (homeShots : string, homeShotsOnTarget : string, awayShots : string, awayShotsOnTarget : string) : void  => {
        if(this.isHome){
            this.shots = Number(homeShots);
            this.shotsOnTarget = Number(homeShotsOnTarget);
            this.opponentShots = Number(awayShots); 
            this.opponentShotsOnTarget = Number(awayShotsOnTarget)
        }
        else{
            this.opponentShots = Number(homeShots);
            this.opponentShotsOnTarget = Number(homeShotsOnTarget);
            this.shots = Number(awayShots); 
            this.shotsOnTarget = Number(awayShotsOnTarget)
        }
    }

    setCorners = (homeCorners : string, awayCorners : string) : void  => {
        if(this.isHome){
            this.corners = Number(homeCorners);
            this.opponentCorners = Number(awayCorners);
        }
        else{
            this.opponentCorners = Number(homeCorners);
            this.corners = Number(awayCorners);
        }
    }

    setCards = (homeCards : string, awayCards : string) : void => {
        if(this.isHome){
            this.cards = Number(homeCards);
            this.opponentCards = Number(awayCards);
        }
        else{
            this.opponentCards = Number(homeCards);
            this.cards = Number(awayCards);
        }
    }

    get isHome(): boolean {
        return this.venue === "Home";
    }

    get isAway(): boolean {
        return this.venue === "Away";
    }
}