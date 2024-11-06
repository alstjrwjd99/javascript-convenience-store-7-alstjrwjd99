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

    getDetailsOfSales(requires, promotions) {
        const bills = [];
        requires.forEach((require) => {
            if (this.isRequireProductPromotion(require, promotions)) { bills.push(this.sellPromotionProduct()); }
            else { bills.push(this.sellGeneralProduct(require.name, require.quantity)); }
        });
        return bills;
    }

    isRequireProductPromotion(require, promotions) {
        const isWithinPromotionPeriod = promotions.find((promotion) => promotion.name === require.promotion);
        if (isWithinPromotionPeriod === undefined) {
            return false;
        }
        return true;
    }

    sellGeneralProduct(purchaseDemandName, purchaseDemandQuantity) {
        const wantItemInfo = this.#generalProduct.find((product) => product.name === purchaseDemandName);
        if (purchaseDemandQuantity <= wantItemInfo.quantity) {
            wantItemInfo.quantity -= purchaseDemandQuantity;
            return [purchaseDemandName, purchaseDemandQuantity, wantItemInfo.price];
        } else {
            console.log('[ERROR] 구매하려는 수량이 부족합니다.');
            return;
        }
    }

    sellPromotionProduct() {

    }

    checkInventoryStatus(requires, promotions) {
        // require = [ Require { name: '콜라', quantity: 10 } ]
        requires.forEach(async (require) => {
            // [콜라-10] 일떄 창고에 콜라가 몇개 남았는지 확인
            // stock = Product {
            //     name: '콜라',
            //     price: '1000',
            //     quantity: '10',
            //     promotion: '탄산2+1'
            //   } 
            const stock = this.findRemainQuantity(this.#promotionProduct, require);
            if (stock === undefined) return;
            // 프로모션 진행중인 것들에서 프로모션 진행인 상품 [콜라]
            // p = Promotion {
            //     name: '탄산2+1',
            //     buy: '2',
            //     get: '1',
            //     start_date: '2024-01-01',
            //     end_date: '2024-12-31'
            //   }
            const p = promotions.find((promotion) => promotion.name === stock.promotion);

            // 프로모션이 진행되는 경우 -> 3개씩 빠짐
            const promotionPackage = p.buy + p.get;

            // 프로모션 중인 상품에 있는 경우
            if (p !== undefined) {
                // 구매하려고 하는 수량
                let purchaseDemandQuantity = require.quantity;
                // 구매한 양
                let purchasedQuantity = 0;
                // 증정
                let present = 0;

                // 사려고 하는 수량보다 프로모션 패키지가 크거나 같은 경우 && 사려고 하는 수량이 창고 수량 이내일 떄
                while (purchaseDemandQuantity >= promotionPackage && (purchasedQuantity + p.buy + present) <= stock.quantity) {
                    purchaseDemandQuantity -= promotionPackage;
                    purchasedQuantity += p.buy;
                    present++;
                }
                if (purchaseDemandQuantity == p.buy && purchasedQuantity + present < stock.quantity) {
                    console.log('2+1인데 2개 들고 온 경우 1개 더 받을 수 있으니까 물어봄');
                    // 프로모션 적용이 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우, 그 수량만큼 추가 여부를 입력받는다.
                    if (await InputView.isBringOneMore(stock.name)) {
                        present++;
                    };
                }
                // 프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우, 일부 수량에 대해 정가로 결제할지 여부를 입력받는다.
                else if (purchaseDemandQuantity > 0) {
                    console.log('사야할게 남았는데 창고에 수량이 부족해서 물어봐야 하는 경우');
                    if (!await InputView.isNotApplyPromotion(stock.name, stock.quantity)) {
                        purchaseDemandQuantity = 0
                    }
                    console.log(purchaseDemandQuantity, purchasedQuantity);
                }

                console.log(`${(purchasedQuantity + purchaseDemandQuantity) * stock.price}원 내야함, 증정 : ${present}`)
                this.#promotionProduct.forEach((product, idx) => {
                    if (product.name === stock.name) {
                        this.#promotionProduct[idx].quantity -= (purchasedQuantity + purchaseDemandQuantity + present);
                        console.log('남은 수량: ', this.#promotionProduct[idx].quantity);
                    }
                });
            }
        });
    }

    findRemainQuantity(targetList, require) {
        return targetList.find(product => product.name === require.name);
    }
}