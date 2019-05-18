
function fixture() {
  return document.querySelector('#qunit-fixture');
}

function insert(template) {
  fixture().append(document.importNode(template.content, true));
}

function clear() {
  fixture().innerHTML = '';
}

export {
  insert,
  clear
};
