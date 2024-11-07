import { Console } from "@woowacourse/mission-utils";
import { PromotionProduct } from "../models/Product.js";

export const OutputView = {
    printStartMessage() {
        Console.print('안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n');
    },
    printProducts(products) {
        products.forEach((product) => {
            Console.print(`- ${product.name} ${product.price.toLocaleString()}원 ${quantityToString(product.quantity)} ${promotionToString(product.promotion)}`);
        })
    },
    printBill(payProducts, memberShipDiscount) {
        let totalProduct = 0;
        let totalMoney = 0;
        let totalPresent = 0;
        const presents = [];
        Console.print(`
===========W 편의점=============
상품명\t\t수량\t금액`);
        payProducts.forEach((product) => {
            let cnt = product.quantity
            if (product instanceof PromotionProduct) {
                cnt += product.present;
                totalProduct += product.present;
                presents.push(product)
            }
            let prName = ''
            if (product.name.length > 3) {
                prName = `${product.name}\t`
            } else {
                prName = `${product.name}\t\t`
            }

            let price = product.price * cnt;

            Console.print(`${prName}${cnt}\t${price.toLocaleString()}`);
            totalProduct += product.quantity;
            totalMoney += price
        });
        if (presents.length !== 0) {
            Console.print(`
===========증	정=============`);
            presents.forEach((present) => {
                Console.print(`${present.name}\t\t${present.present}`);
                totalPresent = present.price;
            });
        };
        Console.print(`==============================`);
        Console.print(`총구매액\t${totalProduct}\t${totalMoney.toLocaleString()}
행사할인\t\t-${totalPresent.toLocaleString()}
멤버십할인\t\t-${memberShipDiscount.toLocaleString()}
내실돈\t\t\t ${(totalMoney - totalPresent - memberShipDiscount).toLocaleString()}`);
    }
}

const promotionToString = (promotion) => {
    if (promotion !== 'null') {
        return promotion;
    }
    return '';
}

const quantityToString = (quantity) => {
    if (quantity <= 0) {
        return '재고 없음';
    }
    return quantity + '개';
}