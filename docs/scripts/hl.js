const highlight = require('highlight.js');

const code = `class GitHubPRs extends Bram.Element {
  static events() {
    return ['pullrequest'];
  }

  connectedCallback() {
    let repo = this.getAttribute('repo');
    let limit = this.getAttribute('limit') || 5;
    this.fetch(repo, limit);
  }

  fetch(repo, limit) {
    let url = \`https://api.github.com/repos/
      \${repo}/pulls?page=1&per_page=\${limit}
      &state=all\`;

    fetch(url).then(res => {
      return res.json();
    }).then(results => {
      results.forEach(pr => {
        let ev = new CustomEvent('pullrequest', {
          detail: pr
        });
        this.dispatchEvent(ev);
      });
    });
  }
}

customElements.define('github-stars', GitHubPRs);


let render = Bram.template('#my-tmpl');
let model = Bram.model({
  prs: []
});

let root = document.querySelector('#bram-info');
root.appendChild(render(model));

let gh = document.querySelector('github-stars');
gh.onpullrequest = function(ev){
  let pr = ev.detail;
  model.prs.push(pr);
};`;

let res = highlight.highlight('javascript', code);
let val = res.value;
console.log(val);
