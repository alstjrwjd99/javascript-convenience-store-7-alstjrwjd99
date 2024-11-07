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

        let restart = false;
        while (true) {
            try {
                if (!restart){
                    await OutputView.printProducts(products);
                    restart = false;
                }
                const requireData = await InputView.readItem();
                const requires = new RequireController(requireData).getRequires();
                const result = await inventoryCtrl.getDetailsOfSales(requires, validPromotion);
                if (result.includes('[ERROR]')){
                    restart = true;
                    OutputView.printErrorMessage();
                    throw new Error("[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.");
                }
    
                const membershipCtrl = new MembershipController(result);
                const memberShipDiscount = await membershipCtrl.getDiscountMembership();
                OutputView.printReceipt(result, memberShipDiscount)
    
                if (!await InputView.isWannaBuyMore()) {
                    break
                };    
            } catch (error) {
                console.log(error);
            }
            
        }
    }
}