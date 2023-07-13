import {
  component,
  html,
  useState,
} from "https://unpkg.com/haunted@4.8.3/haunted.js";

function PackageJsonInput() {
  const [state, setState] = useState("initial"); // initial, loading, loaded, error
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file) => {
    setState("loading");

    if (!file) {
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

  const handleSelectFile = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  return html`
    <link rel="stylesheet" href="./style.css" />
    <section
      class="file-wrapper ${isDragOver ? "drag-over" : ""}"
      @drop=${handleDrop}
      @dragover=${handleDragOver}
      @dragleave=${handleDragLeave}
    >
      <div class="file-input ${state === "error" ? "has-error-message" : ""}">
        <label for="package-json-input">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24px"
            height="24px"
          >
            <path
              fill="currentColor"
              d="M 6 2 C 4.9057453 2 4 2.9057453 4 4 L 4 20 C 4 21.094255 4.9057453 22 6 22 L 18 22 C 19.094255 22 20 21.094255 20 20 L 20 8 L 14 2 L 6 2 z M 6 4 L 13 4 L 13 9 L 18 9 L 18 20 L 6 20 L 6 4 z M 10 12 C 9.448 12 9 12.448 9 13 C 9 13.552 9.448 14 10 14 C 10.552 14 11 13.552 11 13 C 11 12.448 10.552 12 10 12 z M 14 12 C 13.448 12 13 12.448 13 13 C 13 13.552 13.448 14 14 14 C 14.552 14 15 13.552 15 13 C 15 12.448 14.552 12 14 12 z M 9.7070312 15.292969 L 8.2929688 16.707031 C 8.2929688 16.707031 8.6834774 17.084903 9.3027344 17.394531 C 9.9219913 17.70416 10.833333 18 12 18 C 13.166667 18 14.078009 17.70416 14.697266 17.394531 C 15.316523 17.084903 15.707031 16.707031 15.707031 16.707031 L 14.292969 15.292969 C 14.292969 15.292969 14.183477 15.415097 13.802734 15.605469 C 13.421991 15.79584 12.833333 16 12 16 C 11.166667 16 10.578009 15.79584 10.197266 15.605469 C 9.8165222 15.415097 9.7070312 15.292969 9.7070312 15.292969 z"
            /></svg
          ><br />
          <strong>Drag and drop a package.json&nbsp;here</strong><br />
          <small>or click to select a&nbsp;file</small>
        </label>
        <input
          id="package-json-input"
          type="file"
          @change=${handleSelectFile}
          accept=".json,application/JSON,text/JSON"
        />
        ${state === "error"
          ? html`<p class="error">
              ${errorMessage || "An error occurred."}<br />Please select a
              different file.
            </p>`
          : ""}
      </div>
    </section>
  `;
}

export default component(PackageJsonInput);
