import { Bram, createInstance } from '../../../bram.js';

class GitHubPRs extends Bram.Element {
  connectedCallback() {
    let repo = this.getAttribute('repo');
    let limit = this.getAttribute('limit') || 5;
    this.fetch(repo, limit);
  }

  fetch(repo, limit) {
    let url = `https://api.github.com/repos/${repo}/pulls?page=1&per_page=${limit}&state=all`;

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

  set onpullrequest(value) {
    if(this._onpullrequest) {
      this.removeEventListener('pullrequest', this._onpullrequest);
    }
    this._onpullrequest = value;
    this.addEventListener('pullrequest', value);
  }
}

customElements.define('github-prs', GitHubPRs);

let myTemplate = document.querySelector('#my-tmpl');
let instance = createInstance(myTemplate, {
  prs: []
});

let root = document.querySelector('#bram-info');
root.append(instance.fragment);

let gh = document.querySelector('github-prs');
gh.onpullrequest = function(ev){
  let pr = ev.detail;
  instance.model.prs.push(pr);
};
