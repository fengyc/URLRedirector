/**
 * Models of URLRedirector.
 */

function Rule() {
    this.description = null;
    this.origin = null;
    this.exclude = null;
    this.methods = [];
    this.types = [];
    this.target = null;
    this.enable = false;
}
