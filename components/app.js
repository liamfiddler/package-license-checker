import {
  component,
  useState,
  html,
} from "https://unpkg.com/haunted@4.8.3/haunted.js";
import PackageJsonInput from "/components/package-json-input.js";
import LicenseListItem from "/components/license-list-item.js";

customElements.define("package-json-input", PackageJsonInput);
customElements.define("list-item", LicenseListItem);

function App() {
  const [packageJson, setPackageJson] = useState();

  if (!packageJson) {
    return html`
      <package-json-input
        @read-package=${(event) => setPackageJson(event?.detail)}
      ></package-json-input>
    `;
  }

  return html`
    <link rel="stylesheet" href="/style.css" />
    <section class="container">
      <a href="/">&larr; Back</a>
      <h1>${packageJson?.name || "Unnamed package"}</h1>
      <div class="dependency-row">
        <strong>Dependency</strong>
        <strong>License</strong>
      </div>
      ${Object.entries(packageJson?.dependencies || {})?.map(
        ([name, version]) => html`
          <list-item .name=${name} .version=${version}></list-item>
        `
      )}
    </section>
  `;
}

export default component(App);
