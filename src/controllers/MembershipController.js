import { InputView } from "../views/InputView.js";
import { GeneralProduct } from "../models/Product.js";

export default class MembershipController {
    constructor(sellProducts) {
        this.sellProducts = sellProducts;
    }

    async getDiscountMembership() {
        let memberShipDiscount = 0;
        if (await InputView.isMembershipDiscount()) {
            this.sellProducts.forEach(product => {
                if (product instanceof GeneralProduct) {
                    memberShipDiscount += product.price * 0.3;
                }
            });
        }
        return memberShipDiscount;
    }
}