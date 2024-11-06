import { Console } from "@woowacourse/mission-utils";

export const OutputView = {
    printStartMessage() {
        Console.print('안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n');
    },
    printProducts(products) {
        products.forEach((product) => {
            Console.print(`- ${product.name} ${product.price.toLocaleString()}원 ${quantityToString(product.quantity)} ${promotionToString(product.promotion)}`);
        })
    }
    // ...
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