import { InputView } from "../views/InputView.js";
import { OutputView } from "../views/OutputView.js";
import { fileController } from "./FileController.js";
import InventoryController from "./InventoryController.js";
import PromotionController from "./PromotionController.js";
import RequireController from "./RequireController.js";
import MembershipController from "./MembershipController.js"

export default class ConvenienceController {
    async start() {
        const productData = await fileController.loadProducts();
        const promotionData = await fileController.loadPromotions();
        const products = fileController.splitProductsInfo(productData);
        const promotions = fileController.splitPromotionsInfo(promotionData);
        const inventoryCtrl = new InventoryController(products);
        const promotionCtrl = new PromotionController(promotions);
        const validPromotion = promotionCtrl.checkIfWithinPromotionPeriod();

        while (true) {
            OutputView.printProducts(products);
            const requireData = await InputView.readItem();
            const requires = new RequireController(requireData).getRequires();
            const result = await inventoryCtrl.getDetailsOfSales(requires, validPromotion);

            const membershipCtrl = new MembershipController(result);
            const memberShipDiscount = await membershipCtrl.getDiscountMembership();
            OutputView.printReceipt(result, memberShipDiscount)

            if (!await InputView.isWannaBuyMore()) {
                return
            };
        }
    }
}