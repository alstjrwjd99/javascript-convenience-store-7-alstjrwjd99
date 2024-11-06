import { InputView } from "../views/InputView.js";
import { OutputView } from "../views/OutputView.js";
import { fileController } from "./FileController.js";
import InventoryController from "./InventoryController.js";
import PromotionController from "./PromotionController.js";
import RequireController from "./RequireController.js";

export default class ConvenienceController {
    async start() {
        const productData = await fileController.loadProducts();
        const promotionData = await fileController.loadPromotions();
        const products = fileController.splitProductsInfo(productData);
        const promotions = fileController.splitPromotionsInfo(promotionData);
        const inventoryCtrl = new InventoryController(products);
        const promotionCtrl = new PromotionController(promotions);
        const validPromotion = promotionCtrl.checkIfWithinPromotionPeriod();
        OutputView.printProducts(products);
        const requireData = await InputView.readItem();
        const require = new RequireController(requireData).getRequires();
    }
}