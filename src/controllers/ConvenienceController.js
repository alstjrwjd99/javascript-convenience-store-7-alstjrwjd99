import { InputView } from "../views/InputView.js";
import { OutputView } from "../views/OutputView.js";
import { fileController } from "./FileController.js";
import InventoryController from "./InventoryController.js";
import PromotionController from "./PromotionController.js";

export default class ConvenienceController {
    async start() {
        const productData = await fileController.loadProducts();
        const promotionData = await fileController.loadPromotions();
        const products = fileController.splitProductsInfo(productData);
        const promotions = fileController.splitPromotionsInfo(promotionData);
        const inventoryCtrl = new InventoryController(products);
        const promotionCtrl = new PromotionController(promotions);
        console.log(promotionCtrl.checkIfWithinPromotionPeriod());
        OutputView.printProducts(products);
        InputView.readItem();
    }
}