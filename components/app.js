import {
  component,
  useState,
  html,
} from "https://unpkg.com/haunted@4.8.3/haunted.js";
import PackageJsonInput from "/components/package-json-input.js";
import LicenseList from "/components/license-list.js";

customElements.define("package-json-input", PackageJsonInput);
customElements.define("license-list", LicenseList);

function App() {
  const [packageJson, setPackageJson] = useState();

  if (!packageJson) {
    return html`
      <package-json-input
        @read-package=${(event) => setPackageJson(event?.detail)}
      ></package-json-input>
    `;
  }

  return html`<license-list .packageJson=${packageJson}></license-list>`;
}

export default component(App);
