import { Console } from "@woowacourse/mission-utils";

export const OutputView = {
    printStartMessage() {
        Console.print('안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n');
    },
    printProducts(products) {
        products.forEach((product) => {
            let promotion = '';
            if(product.promotion !== 'null'){
                promotion = product.promotion;
            }
            Console.print(`- ${product.name} ${product.price.toLocaleString()}원 ${product.quantity}개 ${promotion}`);
        })
    }
    // ...
}