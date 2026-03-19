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

  const resolvedVersionTooltip = isLoaded
    ? `${dependency?.requestedVersion} (resolves to ${dependency?.resolvedVersion})`
    : "";

  const showPermissiveWarning = isLoaded && !dependency?.isPermissive;

  let showWarning = false;
  let warning = "";
  let warningTooltip = "";

  if (isLoaded) {
    if (!dependency?.isWithinNMinusTwoMajor) {
      showWarning = true;
      warning = "🔽";
      warningTooltip = `${dependency?.resolvedVersion} is greater than n-2 major versions behind latest (${dependency?.latestVersion})`;
    } else if (!dependency?.isWithinNMinusTwoMinor) {
      showWarning = true;
      warning = "⏬";
      warningTooltip = `${dependency?.resolvedVersion} is greater than n-2 minor versions behind latest (${dependency?.latestVersion})`;
    }
  }

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
      <span title="${resolvedVersionTooltip}">
        ${dependency?.homepage
      ? html`<a href="${dependency?.homepage}">${packageName}</a>`
      : packageName}
        ${showWarning ? html`<span title="${warningTooltip}">${warning}</span>` : ""}
      </span>
      &#09;
      <span>
        ${isLoaded && licenseName !== "UNKNOWN" && licenseName !== "UNLICENSED"
      ? html`<a href="${licenseUrl(dependency?.license)}"
              >${licenseName}</a
            >`
      : licenseName}
        ${showPermissiveWarning ? html`<span title="Might not be a permissive license">⚠️</span>` : ""}
      </span>
    </div>
  `;
}

export default component(LicenseListItem);
