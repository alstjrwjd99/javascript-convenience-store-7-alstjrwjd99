export default class Promotion {
    constructor(name, buy, get, start_date, end_date) {
        this.name = name;
        this.buy = Number(buy);
        this.get = Number(get);
        this.start_date = new Date(start_date);
        this.end_date = new Date(end_date);
    }
}