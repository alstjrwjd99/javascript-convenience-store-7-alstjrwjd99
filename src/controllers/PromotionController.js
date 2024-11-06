import { DateTimes } from "@woowacourse/mission-utils";

export default class PromotionController {
    #promotionInfo = [];

    constructor(promotionInfos) {
        this.#promotionInfo = promotionInfos;
    }

    checkIfWithinPromotionPeriod() {
        const currentTime = DateTimes.now()
        const inProgressPromotion = this.#promotionInfo.filter((promotion) => {
            return new Date(promotion.start_date) <= currentTime && new Date(promotion.end_date) >= currentTime;
        });
        return inProgressPromotion;
    }
}