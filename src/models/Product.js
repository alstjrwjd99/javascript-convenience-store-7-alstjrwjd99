export default class Product {
    constructor(name, price, quantity, promotion) {
        this.name = name;
        this.price = Number(price);
        this.quantity = Number(quantity);
        this.promotion = promotion;
    }
}