import { Console } from "@woowacourse/mission-utils";

export const InputView = {
    async readItem() {
        const input = await Console.readLineAsync("구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n");
        return input;
    },
    async isBringOneMore(name) {
        while (true) {
            const input = await Console.readLineAsync(`현재 ${name}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)`);
            if (input === 'Y') return true;
            else if (input === 'N') return false;
        }
    },
    async isNotApplyPromotion(name, count) {
        while (true) {
            const input = await Console.readLineAsync(`현재 ${name} ${count}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)`);
            if (input === 'Y') return true;
            else if (input === 'N') return false;
        }
    }
}