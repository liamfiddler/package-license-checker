import {
  component,
  html,
  useState,
  useEffect,
} from "https://unpkg.com/haunted@4.8.3/haunted.js";
import { getDependencyInfo, licenseUrl } from "../utils.js";

function LicenseListItem({ name = "", version = "" }) {
  const [dependency, setDependency] = useState();
  const isLoaded = !!dependency;
  const packageName = name || "Unknown";

  const licenseName = isLoaded
    ? `${dependency?.license || "Unknown"}`?.toUpperCase()
    : "░░░░░";

  useEffect(() => {
    if (!name) {
      return;
    }

    getDependencyInfo([name, version]).then((response) => {
      setDependency(response);

      const event = new CustomEvent("get-license", {
        bubbles: true, // this lets the event bubble up through the DOM
        composed: true, // this lets the event cross the Shadow DOM boundary
        detail: response,
      });

      this.dispatchEvent(event);
    });
  }, [name, version]);

  return html`
    <link rel="stylesheet" href="./style.css" />
    <div class="dependency-row">
      <span>
        ${dependency?.homepage
          ? html`<a href="${dependency?.homepage}">${packageName}</a>`
          : packageName}
      </span>
      &#09;
      <span>
        ${isLoaded && licenseName !== "UNKNOWN" && licenseName !== "UNLICENSED"
          ? html`<a href="${licenseUrl(dependency?.license)}"
              >${licenseName}</a
            >`
          : licenseName}
      </span>
    </div>
  `;
}

export default component(LicenseListItem);
