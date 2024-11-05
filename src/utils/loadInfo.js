import fs from 'fs';
import path from 'path';

async function loadFile(fileName) {
  const filePath = path.join(process.cwd(), 'public', fileName);
  
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return data;
  } catch (error) {
    throw new Error(`Error loading file: ${filePath}`);
  }
}

async function loadProducts() {
  return loadFile('products.md');
}

async function loadPromotions() {
  return loadFile('promotions.md');
}

export { loadProducts, loadPromotions };