
mocha.setup('bdd');
assert = chai.assert;

window.addEventListener('load', () => {
  mocha.run();
});