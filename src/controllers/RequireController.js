import Require from "../models/Require.js";

export default class RequireController {
    constructor(require) {
        this.requires = require;
    }

    getRequires() {
        if (this.splitRequires()) return;
        this.requires = this.requires.map(req => req.slice(1, req.length - 1).split('-'));
        console.log('getRequires -> ',this.requires);
        if (this.mapRequires()) return;
        return this.requires;
    }

    mapRequires() {
        let noError = true;
        this.requires = this.requires.map((r) => {
            if (r[0].trim() == '' || isNaN(Number(r[1])) || r[1].trim() === '') { noError = false; }
            return new Require(r[0], Number(r[1]))
        });
        if (!noError) return true;
        return false
    }

    splitRequires() {
        this.requires = this.requires.split(',');
        console.log('splitRequires -> ',this.requires);
        if (!this.validator()) return false;
        return true;
    }

    validator() {
        const regex = /^[^ㄱ-ㅎ가-힣+-\d^]$/;

        for (const require of this.requires) {
            if (!regex.test(require)) {
                return false;
            }
        }
        return true;
    }
}