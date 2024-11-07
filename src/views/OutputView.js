import { MissionUtils } from "@woowacourse/mission-utils";
import { PromotionProduct } from "../models/Product.js";

export const OutputView = {
    async printErrorMessageInvalidInput(){
        await MissionUtils.Console.print("[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.");
    },
    async printErrorMessageExceed(){
        await MissionUtils.Console.print("[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.");
    },
    async printErrorMessageNoExist(){
        await MissionUtils.Console.print("[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.");
    },
    async printStartMessage() {
        await MissionUtils.Console.print('안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n');
    },
    async printProducts(products) {
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            await MissionUtils.Console.print(`- ${product.name} ${product.price.toLocaleString()}원 ${product.quantity}개 ${promotionToString(product.promotion)}`);
            if (i < products.length - 1 && products[i].name != products[i + 1].name && products[i].promotion !== 'null') {
                await MissionUtils.Console.print(`- ${product.name} ${product.price.toLocaleString()}원 재고 없음`);
            }
        }
    },
    printReceipt(payProducts, memberShipDiscount) {
        let totalProduct = 0;
        let totalMoney = 0;
        let totalPresent = 0;
        const presents = [];
        MissionUtils.Console.print(`
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

            MissionUtils.Console.print(`${prName}${cnt}\t${price.toLocaleString()}`);
            totalProduct += product.quantity;
            totalMoney += price
        });
        if (presents.length !== 0) {
            MissionUtils.Console.print(`
===========증	정=============`);
            presents.forEach((present) => {
                MissionUtils.Console.print(`${present.name}\t\t${present.present}`);
                totalPresent = present.present * present.price;
            });
        };
        MissionUtils.Console.print(`==============================`);
        MissionUtils.Console.print(`총구매액\t${totalProduct}\t${totalMoney.toLocaleString()}
행사할인\t\t${totalPresent ? 0 : -1 * totalPresent.toLocaleString()}
멤버십할인\t\t${memberShipDiscount === 0 ? 0 : -1 * memberShipDiscount.toLocaleString()}
내실돈\t\t\t ${(totalMoney - totalPresent - memberShipDiscount).toLocaleString()}`);
    }
}

const promotionToString = (promotion) => {
    if (promotion !== 'null') {
        return promotion;
    }
    return '';
}