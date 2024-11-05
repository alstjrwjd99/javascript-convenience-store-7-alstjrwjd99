import ConvenienceController from "./controllers/ConvenienceController.js";

class App {
  async run() {
    const convenienceController = new ConvenienceController();
    convenienceController.start();
  }
}

export default App;
