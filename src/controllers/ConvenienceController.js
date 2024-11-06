import { InputView } from "../views/InputView.js";
import { OutputView } from "../views/OutputView.js";
import { fileController } from "./FileController.js";
import InventoryController from "./InventoryController.js";

export default class ConvenienceController {
    async start() {
        const data = await fileController.loadProducts();
        const products = fileController.splitProductsInfo(data);
        new InventoryController(products);
        OutputView.printProducts(products);
        InputView.readItem();
    }
}