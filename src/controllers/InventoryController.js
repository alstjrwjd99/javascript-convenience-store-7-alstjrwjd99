import { GeneralProduct, PromotionProduct } from "../models/Product.js";
import { InputView } from "../views/InputView.js";
import { OutputView } from "../views/OutputView.js";

export default class InventoryController {
    #generalProduct = [];
    #promotionProduct = [];

    constructor(totalProduct) {
        totalProduct.forEach((product) => {
            if (product.promotion === 'null') {
                this.#generalProduct.push(product);
            } else {
                this.#promotionProduct.push(product);
            }
        });
    }

    async getDetailsOfSales(requires, promotions) {
        const bills = [];

        // forEach()는 비동기 처리를 기다려주지 않음
        for (const require of requires) {
            if (this.isRequireProductPromotion(require)) {
                const a = await this.sellPromotionProduct(require.name, require.quantity, promotions);
                if (a == undefined) {
                    return []
                } else if (a === '[ERROR]') {
                    return '[ERROR]';
                }
                if (a.length >= 2) {
                    bills.push(...a);
                } else {
                    bills.push(a);
                }
            } else {
                bills.push(this.sellGeneralProduct(require.name, require.quantity));
            }
        }
        return bills;
    }

    isRequireProductPromotion(require) {
        const isWithinPromotionPeriod = this.#promotionProduct.find(product => product.name === require.name);
        if (isWithinPromotionPeriod === undefined) {
            return false;
        }
        return true;
    }

    sellGeneralProduct(purchaseDemandName, purchaseDemandQuantity) {
        const wantItemInfo = this.findWantItem(purchaseDemandName, this.#generalProduct);
        if (wantItemInfo === undefined) {
            OutputView.printErrorMessageNoExist();
            return;
        }

        try {
            if (purchaseDemandQuantity <= wantItemInfo.quantity) {
                wantItemInfo.quantity -= purchaseDemandQuantity;
                return new GeneralProduct(wantItemInfo.name, wantItemInfo.price, purchaseDemandQuantity, 'null');
            } else {
                throw new Error("[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.");
            }
        } catch (error) {
            return "[ERROR]";
        }
    }

    findWantItem(purchaseDemandName, products) {
        return products.find((product) => product.name === purchaseDemandName);
    }
    
    async sellPromotionProduct(purchaseDemandName, purchaseDemandQuantity, promotions) {
        const inventoryItemInfo = this.findWantItem(purchaseDemandName, this.#promotionProduct);
        
        if (inventoryItemInfo == undefined) {
            await OutputView.printErrorMessageNoExist();
            return this.sellGeneralProduct(purchaseDemandName, purchaseDemandQuantity);
        }

        const promo = this.findWantItem(inventoryItemInfo.promotion, promotions)

        if (promo == undefined) {
            return this.sellGeneralProduct(purchaseDemandName, purchaseDemandQuantity);
        }

        if (purchaseDemandQuantity <= inventoryItemInfo.quantity) {
            let present = Math.floor(purchaseDemandQuantity / (promo.buy + promo.get));
            let purchased = present === 0 ? purchaseDemandQuantity : present * promo.buy;
            let remainDemand = purchaseDemandQuantity - present - purchased;

            if (purchaseDemandQuantity % (promo.buy + promo.get) == promo.buy) {
                if (await InputView.isBringOneMore(inventoryItemInfo.name)) {
                    present++;
                }
            } else if (remainDemand > 0) {
                if (await InputView.isNotApplyPromotion(inventoryItemInfo.name, remainDemand)) {
                    purchased += remainDemand;
                    remainDemand = 0;
                }
            }

            inventoryItemInfo.quantity = inventoryItemInfo.quantity - purchased - present;
            return new PromotionProduct(inventoryItemInfo.name, inventoryItemInfo.price, purchased, inventoryItemInfo.promotion, present);
        }

        else {
            // 위의 로직 수행하고 남은 remain을 가지고 일반 창고에서 메꿈
            const morePurchaseQuantity = purchaseDemandQuantity - inventoryItemInfo.quantity;

            purchaseDemandQuantity = inventoryItemInfo.quantity;

            let present = Math.floor(purchaseDemandQuantity / (promo.buy + promo.get));    // 증정
            let purchased = present * promo.buy;  // 구매한 개수
            let remain = purchaseDemandQuantity - present - purchased;

            purchased += remain;
            remain = 0;
            inventoryItemInfo.quantity = inventoryItemInfo.quantity - purchased - present

            const generalProduct = this.#generalProduct.find(product => product.name === purchaseDemandName);
            if (morePurchaseQuantity > generalProduct.quantity) {
                return '[ERROR]';
            }

            const fromGeneralProduct = this.sellGeneralProduct(purchaseDemandName, morePurchaseQuantity);

            return [new PromotionProduct(inventoryItemInfo.name, inventoryItemInfo.price, purchased, inventoryItemInfo.promotion, present),
            new GeneralProduct(inventoryItemInfo.name, fromGeneralProduct.price, fromGeneralProduct.quantity, 'null')];
        }
    }
}