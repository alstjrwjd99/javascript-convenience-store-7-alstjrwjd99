export default class InventoryController {
    #generalProduct = [];
    #promotionProduct = [];

    constructor(totalProduct) {
        totalProduct.forEach((product) => {
            if (product.promotion === 'null') {
                this.#generalProduct.push(product);
            }else {
                this.#promotionProduct.push(product);
            }
        });
    }

    
}