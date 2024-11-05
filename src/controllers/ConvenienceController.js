import { InputView } from "../views/InputView.js";
import { OutputView } from "../views/OutputView.js";
import { fileController } from "./FileController.js";

export default class ConvenienceController {
    async start() {
        const data = await fileController.loadProducts();
        const products = fileController.splitProductsInfo(data);
        OutputView.printProducts(products);
        InputView.readItem();
    }
}