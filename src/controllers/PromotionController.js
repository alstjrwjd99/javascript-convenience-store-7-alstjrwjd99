import { DateTimes } from "@woowacourse/mission-utils";

export default class PromotionController {
    #promotionInfo = [];

    constructor(promotionInfos) {
        this.#promotionInfo = promotionInfos;
    }

    checkIfWithinPromotionPeriod() {
        const currentTime = DateTimes.now()
        const inProgressPromotion = this.#promotionInfo.filter((promotion) => {
            return promotion.start_date <= currentTime && promotion.end_date >= currentTime;
        });
        return inProgressPromotion;
    }


}