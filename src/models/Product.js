export class Product {
    constructor(name, price, quantity, promotion) {
        this.name = name;
        this.price = Number(price);
        this.quantity = Number(quantity);
        this.promotion = promotion;
    }
}

export class GeneralProduct extends Product {
    constructor(name, price, quantity, promotion) {
        super(name, price, quantity, promotion);
    }
}

export class PromotionProduct extends Product {
    constructor(name, price, quantity, promotion, present) {
        super(name, price, quantity, promotion);
        this.present = present;
    }
}