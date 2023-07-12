import {
  component,
  useState,
  html,
} from "https://unpkg.com/haunted@4.8.3/haunted.js";
import PackageJsonInput from "./package-json-input.js";
import LicenseListItem from "./license-list-item.js";

customElements.define("package-json-input", PackageJsonInput);
customElements.define("list-item", LicenseListItem);

function App() {
  const [packageJson, setPackageJson] = useState();
  const [csv, setCsv] = useState("");

  const downloadCsv = () => {
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "licenses.csv");
    link.click();
  };

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
          <list-item
            .name=${name}
            .version=${version}
            @get-license=${(event) => {
              setCsv(
                (value) => value + `"${name}","${event?.detail?.license}"\n`
              );
            }}
          ></list-item>
        `
      )}
      <button type="button" @click=${downloadCsv}>Download as CSV</button>
    </section>
  `;
}

export default component(App);
