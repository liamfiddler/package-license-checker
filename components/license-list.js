import {
  component,
  html,
  useState,
  useEffect,
} from "https://unpkg.com/haunted@4.8.3/haunted.js";
import { getDependencies, licenseUrl, arrayToCsv } from "../utils.js";

function LicenseList({ packageJson = {} }) {
  const [dependencies, setDependencies] = useState();

  useEffect(() => {
    if (!!packageJson?.dependencies) {
      getDependencies(packageJson).then(setDependencies);
    }
  }, [packageJson]);

  const downloadCsv = () => {
    const csv = arrayToCsv(
      dependencies.map((item) => [
        item?.name || "Unknown",
        item?.license || "Unknown",
        item?.homepage || "",
      ])
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "licenses.csv");
    link.click();
  };

  if (!dependencies) {
    return html`
      <link rel="stylesheet" href="/style.css" />
      <p>Loading...</p>
    `;
  }

  return html`
    <link rel="stylesheet" href="/style.css" />
    <a href="/">&larr; Back</a>
    <h1>License List</h1>
    <h2>${packageJson?.name || "Unnamed package"}</h2>
    <table>
      <tr>
        <th>Dependency</th>
        <th>License</th>
      </tr>
      ${dependencies?.map(({ name, license, homepage }) => {
        const licenseName = license?.toUpperCase() || "Unknown";

        return html`
          <tr>
            <td>
              ${homepage ? html`<a href="${homepage}">${name}</a>` : name}
            </td>
            <td>
              ${licenseName !== "Unknown" && licenseName !== "UNLICENSED"
                ? html`<a href="${licenseUrl(license)}">${licenseName}</a>`
                : licenseName}
            </td>
          </tr>
        `;
      })}
    </table>
    <button type="button" @click=${downloadCsv}>Download CSV</button>
  `;
}

export default component(LicenseList);
