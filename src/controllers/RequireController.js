import Require from "../models/Require.js";

export default class RequireController {
    constructor(require) {
        this.requires = require;
    }

    getRequires() {
        if (this.splitRequires()) return;
        this.requires = this.requires.map(req => req.slice(1, req.length - 1).split('-'));
        this.requires = this.requires.map(r => new Require(r[0], Number(r[1])));
        return this.requires;
    }

    splitRequires() {
        this.requires = this.requires.split(',');
        if (!this.validator()) return false;
        return true;
    }

    validator() {
        const regex = /^[^-\s]+-\d+$/;

        for (const require of this.requires) {
            if (!regex.test(require)) {
                return false;
            }
        }
        return true;
    }
}