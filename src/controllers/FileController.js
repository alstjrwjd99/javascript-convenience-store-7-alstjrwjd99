import fs from 'fs';
import path from 'path';
import Promotion from '../models/Promotion.js';
import Product from '../models/Product.js';

class FileController {
  async loadFile(fileName) {
    const filePath = path.join(process.cwd(), 'public', fileName);

    try {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      return data;
    } catch (error) {
      throw new Error(`[Error] loading file: ${filePath}`);
    }
  }

  async loadProducts() {
    return await this.loadFile('products.md');
  }

  async loadPromotions() {
    return await this.loadFile('promotions.md');
  }

  splitProductsInfo(productsInfo) {
    const products = [];
    productsInfo.trim().split('\n').slice(1).forEach((line) => {
      products.push(new Product(...line.split(',')));
    })
    return products;
  }

  splitPromotionsInfo(promotionsInfo) {
    const promotions = [];
    promotionsInfo.trim().split('\n').slice(1).forEach((line) => {
      promotions.push(new Promotion(...line.split(',')));
    })
    return promotions;
  }
}

export const fileController = new FileController();