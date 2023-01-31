import {
  component,
  html,
  useState,
} from "https://unpkg.com/haunted@4.8.3/haunted.js";

function PackageJsonInput() {
  const [state, setState] = useState("initial"); // initial, loading, loaded, error
  const [errorMessage, setErrorMessage] = useState("");

  const handleSelectFile = (e) => {
    let file;

    setState("loading");

    try {
      file = e.target.files[0];
    } catch (e) {
      console.error(e);
      setErrorMessage("No file selected.");
      setState("error");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);

        if (!json?.dependencies) {
          setErrorMessage("No dependencies found in the selected file.");
          setState("error");
          return;
        }

        const event = new CustomEvent("read-package", {
          bubbles: true, // this lets the event bubble up through the DOM
          composed: true, // this lets the event cross the Shadow DOM boundary
          detail: json,
        });

        this.dispatchEvent(event);
        setState("loaded");
      } catch (e) {
        console.error(e);
        setErrorMessage("Could not parse JSON from the selected file.");
        setState("error");
      }
    };

    reader.onerror = () => {
      console.error(reader.error);
      setErrorMessage("Could not read the selected file.");
      setState("error");
    };

    reader.readAsText(file);
  };

  return html`
    <link rel="stylesheet" href="/style.css" />
    <div class="file-input${state === "error" ? " has-error-message" : ""}">
      <label for="package-json-input">Select a package.json file</label><br />
      <input
        id="package-json-input"
        type="file"
        @change=${handleSelectFile}
        accept=".json,application/JSON,text/JSON"
      />
      ${state === "error"
        ? html`<p>${errorMessage || "An error occurred."}</p>`
        : ""}
    </div>
  `;
}

export default component(PackageJsonInput);
