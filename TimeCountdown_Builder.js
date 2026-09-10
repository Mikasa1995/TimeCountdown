(function() {
  let template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: block;
        padding: 10px;
        font-family: sans-serif;
        font-size: 13px;
      }
      .field {
        margin-bottom: 12px;
      }
      label {
        display: block;
        margin-bottom: 4px;
        font-weight: bold;
        color: #333;
      }
      input[type="text"] {
        width: 100%;
        padding: 6px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      input[type="color"] {
        width: 40px;
        height: 28px;
        padding: 0;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
    <div class="field">
      <label>Target Date (ISO)</label>
      <input id="dateInput" type="text" placeholder="2026-12-31T23:59:59" />
    </div>
    <div class="field">
      <label>Prefix Text</label>
      <input id="prefixInput" type="text" placeholder="Time until go-live" />
    </div>
    <div class="field">
      <label>Prefix Color</label>
      <input id="prefixColorInput" type="color" />
    </div>
    <div class="field">
      <label>Countdown Color</label>
      <input id="countdownColorInput" type="color" />
    </div>
    <div class="field">
      <label>Background Color</label>
      <input id="bgColorInput" type="color" />
    </div>
    <div class="field">
      <label>Caption After Countdown</label>
      <input id="captionInput" type="text" placeholder="Project is live" />
    </div>
  `;

  class CountdownBuilder extends HTMLElement {
    constructor() {
      super();
      let shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {};

      const bind = (id, prop, eventType) => {
        const el = shadowRoot.querySelector(id);
        el.addEventListener(eventType || "change", () => {
          this.dispatchEvent(new CustomEvent("propertiesChanged", {
            detail: { properties: { [prop]: el.value } }
          }));
        });
      };

      bind("#dateInput", "date", "change");
      bind("#prefixInput", "prefixText", "change");
      bind("#prefixColorInput", "prefixColor", "input");
      bind("#countdownColorInput", "countdownColor", "input");
      bind("#bgColorInput", "backgroundColor", "input");
      bind("#captionInput", "captionaftercountdown", "change");
    }

    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = { ...this._props, ...changedProperties };
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      const shadowRoot = this.shadowRoot;
      const setVal = (id, val, def) => {
        if (val !== undefined) {
          shadowRoot.querySelector(id).value = val || def;
        }
      };
      setVal("#dateInput", this._props.date, "2099-01-01T00:00");
      setVal("#prefixInput", this._props.prefixText, "Time until go-live");
      setVal("#prefixColorInput", this._props.prefixColor, "#cccccc");
      setVal("#countdownColorInput", this._props.countdownColor, "#ffffff");
      setVal("#bgColorInput", this._props.backgroundColor, "#333333");
      setVal("#captionInput", this._props.captionaftercountdown, "Project is live");
    }
  }

  customElements.define(
    "com-mikasa1995-sap-timecountdown-builder",
    CountdownBuilder
  );
})();
