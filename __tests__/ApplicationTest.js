import App from "../src/App.js";
import { MissionUtils } from "@woowacourse/mission-utils";
import { EOL as LINE_SEPARATOR } from "os";
import { fileController } from "../src/controllers/FileController.js";
import Product from "../src/models/Product.js";
import Promotion from "../src/models/Promotion.js";

const mockQuestions = (inputs) => {
  const messages = [];

  MissionUtils.Console.readLineAsync = jest.fn((prompt) => {
    messages.push(prompt);
    const input = inputs.shift();

    if (input === undefined) {
      throw new Error("NO INPUT");
    }

    return Promise.resolve(input);
  });

  MissionUtils.Console.readLineAsync.messages = messages;
};

const mockNowDate = (date = null) => {
  const mockDateTimes = jest.spyOn(MissionUtils.DateTimes, "now");
  mockDateTimes.mockReturnValue(new Date(date));
  return mockDateTimes;
};

const getLogSpy = () => {
  const logSpy = jest.spyOn(MissionUtils.Console, "print");  logSpy.mockClear();
  return logSpy;
};

const getOutput = (logSpy) => {
  return [...logSpy.mock.calls].join(LINE_SEPARATOR);
};

const expectLogContains = (received, expects) => {
  expects.forEach((exp) => {
    expect(received).toContain(exp);
  });
};

const expectLogContainsWithoutSpacesAndEquals = (received, expects) => {
  const processedReceived = received.replace(/[\s=]/g, "");
  expects.forEach((exp) => {
    expect(processedReceived).toContain(exp);
  });
};

const runExceptions = async ({
  inputs = [],
  inputsToTerminate = [],
  expectedErrorMessage = "",
}) => {
  // given
  const logSpy = getLogSpy();
  mockQuestions([...inputs, ...inputsToTerminate]);

  // when
  const app = new App();
  await app.run();

  // then
  expect(logSpy).toHaveBeenCalledWith(
    expect.stringContaining(expectedErrorMessage)
  );
};

const run = async ({
  inputs = [],
  inputsToTerminate = [],
  expected = [],
  expectedIgnoringWhiteSpaces = [],
}) => {
  // given
  const logSpy = getLogSpy();
  mockQuestions([...inputs, ...inputsToTerminate]);

  // when
  const app = new App();
  await app.run();

  const output = getOutput(logSpy);

  // then
  if (expectedIgnoringWhiteSpaces.length > 0) {
    expectLogContainsWithoutSpacesAndEquals(
      output,
      expectedIgnoringWhiteSpaces
    );
  }
  if (expected.length > 0) {
    expectLogContains(output, expected);
  }
};

const INPUTS_TO_TERMINATE = ["[비타민워터-1]", "N", "N"];

describe("편의점", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test("파일에 있는 상품 목록 출력", async () => {
    await run({
      inputs: ["[콜라-1]", "N", "N"],
      expected: [
        /* prettier-ignore */
        "- 콜라 1,000원 10개 탄산2+1",
        "- 콜라 1,000원 10개",
        "- 사이다 1,000원 8개 탄산2+1",
        "- 사이다 1,000원 7개",
        "- 오렌지주스 1,800원 9개 MD추천상품",
        "- 오렌지주스 1,800원 재고 없음",
        "- 탄산수 1,200원 5개 탄산2+1",
        "- 탄산수 1,200원 재고 없음",
        "- 물 500원 10개",
        "- 비타민워터 1,500원 6개",
        "- 감자칩 1,500원 5개 반짝할인",
        "- 감자칩 1,500원 5개",
        "- 초코바 1,200원 5개 MD추천상품",
        "- 초코바 1,200원 5개",
        "- 에너지바 2,000원 5개",
        "- 정식도시락 6,400원 8개",
        "- 컵라면 1,700원 1개 MD추천상품",
        "- 컵라면 1,700원 10개",
      ],
    });
  });

  test("여러 개의 일반 상품 구매", async () => {
    await run({
      inputs: ["[비타민워터-3],[물-2],[정식도시락-2]", "N", "N"],
      expectedIgnoringWhiteSpaces: ["내실돈18,300"],
    });
  });

  test("기간에 해당하지 않는 프로모션 적용", async () => {
    mockNowDate("2024-02-01");

    await run({
      inputs: ["[감자칩-2]", "N", "N"],
      expectedIgnoringWhiteSpaces: ["내실돈3,000"],
    });
  });

  test("예외 테스트", async () => {
    await runExceptions({
      inputs: ["[컵라면-12]", "N", "N"],
      inputsToTerminate: INPUTS_TO_TERMINATE,
      expectedErrorMessage:
        "[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.",
    });
  });

  test('products.md 파일 불러오기', async () => {
    const data = await fileController.loadProducts();
    
    const expectedData = `
name,price,quantity,promotion
콜라,1000,10,탄산2+1
콜라,1000,10,null
사이다,1000,8,탄산2+1
사이다,1000,7,null
오렌지주스,1800,9,MD추천상품
탄산수,1200,5,탄산2+1
물,500,10,null
비타민워터,1500,6,null
감자칩,1500,5,반짝할인
감자칩,1500,5,null
초코바,1200,5,MD추천상품
초코바,1200,5,null
에너지바,2000,5,null
정식도시락,6400,8,null
컵라면,1700,1,MD추천상품
컵라면,1700,10,null`;
    expect(data.trim()).toBe(expectedData.trim());

  });

  test('promotions.md  파일 불러오기', async () => {
    const data = await fileController.loadPromotions();
    
    const expectedData = `
name,buy,get,start_date,end_date
탄산2+1,2,1,2024-01-01,2024-12-31
MD추천상품,1,1,2024-01-01,2024-12-31
반짝할인,1,1,2024-11-01,2024-11-30`;
    expect(data.trim()).toBe(expectedData.trim());
  });

  test('product 정보 분리해서 객체화', async () => {

    const input = `
name,price,quantity,promotion
콜라,1000,10,탄산2+1
사이다,1000,8,탄산2+1
오렌지주스,1800,9,MD추천상품
    `;
    
    const data = fileController.splitProductsInfo(input);
    
    const expectedProducts = [
      new Product('콜라', '1000', '10', '탄산2+1'),
      new Product('사이다', '1000', '8', '탄산2+1'),
      new Product('오렌지주스', '1800', '9', 'MD추천상품')
    ];
  
    expect(data).toEqual(expectedProducts);
  });

  test('promotion 정보 분리해서 객체화', async () => {

    const input = `
name,buy,get,start_date,end_date
탄산2+1,2,1,2024-01-01,2024-12-31
MD추천상품,1,1,2024-01-01,2024-12-31
반짝할인,1,1,2024-11-01,2024-11-30
    `;
    
    const data = fileController.splitPromotionsInfo(input);
    
    const expectedProducts = [
      new Promotion('탄산2+1','2','1','2024-01-01','2024-12-31'),
      new Promotion('MD추천상품','1','1','2024-01-01','2024-12-31'),
      new Promotion('반짝할인','1','1','2024-11-01','2024-11-30')
    ];
  
    expect(data).toEqual(expectedProducts);
  });
});
