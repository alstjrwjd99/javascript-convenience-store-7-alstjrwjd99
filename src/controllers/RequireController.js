import Require from "../models/Require.js";

export default class RequireController {
    constructor(require) {
        this.requires = require.split(',').map(req => req.slice(1, req.length - 1).split('-')).map(r => new Require(r[0], Number(r[1])))
    }

    getRequires() {
        return this.requires
    }
}