import { GeneralProduct, PromotionProduct } from "../models/Product.js";
import { InputView } from "../views/InputView.js";

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
                bills.push(await this.sellPromotionProduct(require.name, require.quantity, promotions));
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
        // console.log('일반 창고에서 재고 찾기 시작');
        const wantItemInfo = this.findWantItem(purchaseDemandName, this.#generalProduct);
        if (wantItemInfo == undefined) {
            console.log('[ERROR] 구매하려는 품목이 없습니다.');
            return;
        }
        if (purchaseDemandQuantity <= wantItemInfo.quantity) {
            wantItemInfo.quantity -= purchaseDemandQuantity;
            console.log('일반 창고에서', purchaseDemandQuantity * wantItemInfo.price, '원 사용');
            return new GeneralProduct(wantItemInfo.name, wantItemInfo.price, purchaseDemandQuantity, 'null');
        } else {
            console.log('[ERROR] 구매하려는 수량이 부족합니다.');
            return;
        }
    }

    findWantItem(purchaseDemandName, products) {
        return products.find((product) => product.name === purchaseDemandName);
    }

    async sellPromotionProduct(purchaseDemandName, purchaseDemandQuantity, promotions) {
        console.log('프로모션 창고에서 재고 찾기 시작');
        const inventoryItemInfo = this.findWantItem(purchaseDemandName, this.#promotionProduct);
        // 프로모션 적용 기간인데 프로모션 상품이 없는 경우 일반 상품 재고를 가져다가 판다.
        if (inventoryItemInfo == undefined) {
            console.log('[ERROR] 프로모션 상품의 재고가 부족합니다.')
            return this.sellGeneralProduct(purchaseDemandName, purchaseDemandQuantity);
        }
        const promo = promotions.find(promotion => promotion.name === inventoryItemInfo.promotion);

        if (purchaseDemandQuantity <= inventoryItemInfo.quantity) {
            let present = Math.floor(purchaseDemandQuantity / (promo.buy + promo.get));
            let purchased = present === 0 ? purchaseDemandQuantity : present * promo.buy;
            let remainDemand = purchaseDemandQuantity - present - purchased;

            if (purchaseDemandQuantity % (promo.buy + promo.get) == promo.buy) {
                // 현재 {상품명}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)를 물어봐야함
                if (await InputView.isBringOneMore(inventoryItemInfo.name)) {
                    present++;
                }
            } else if (remainDemand > 0) {
                // 현재 콜라 1개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)
                if (await InputView.isNotApplyPromotion(inventoryItemInfo.name, remainDemand)) {
                    purchased += remainDemand;
                    remainDemand = 0;
                }
            }

            inventoryItemInfo.quantity = inventoryItemInfo.quantity - purchased - present;
            console.log('프로모션 구매한 수량', purchased);
            console.log('프로모션 증정', present);
            console.log('프로모션 창고에 남은 수량 ', inventoryItemInfo.quantity);
            console.log('프로모션 창고에 가져다 줘야할 돈 ', purchased * inventoryItemInfo.price);
            return new PromotionProduct(inventoryItemInfo.name, inventoryItemInfo.price, purchased, inventoryItemInfo.promotion, present);
        }

        else {
            // 현재 {상품명} {수량}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)
            // 위의 로직 수행하고 남은 remain을 가지고 일반 창고에서 메꿈
            const morePurchaseQuantity = purchaseDemandQuantity - inventoryItemInfo.quantity;

            purchaseDemandQuantity = inventoryItemInfo.quantity;

            let present = Math.floor(purchaseDemandQuantity / (promo.buy + promo.get));    // 증정
            let purchased = present * promo.buy;  // 구매한 개수
            let remain = purchaseDemandQuantity - present - purchased;

            purchased += remain;
            remain = 0;
            inventoryItemInfo.quantity = inventoryItemInfo.quantity - purchased - present
            // console.log('프로모션 구매한 수량', purchased);
            // console.log('프로모션 서비스 ', present);
            // console.log('프로모션 창고에 가져다 줘야할 돈 ', purchased * inventoryItemInfo.price);
            // console.log('프로모션 창고에 남은 수량 ', inventoryItemInfo.quantity);
            const fromGeneralProduct = this.sellGeneralProduct(purchaseDemandName, morePurchaseQuantity);

            // console.log('일반 창고에서 가져온 수량 ', fromGeneralProduct.quantity);
            // console.log('일반 창고에다가 줘야하는 돈 ', fromGeneralProduct.price);

            return [new PromotionProduct(inventoryItemInfo.name, inventoryItemInfo.price, purchased, inventoryItemInfo.promotion, present),
            new GeneralProduct(inventoryItemInfo.name, fromGeneralProduct.price, fromGeneralProduct.quantity, 'null')];
        }
    }
}