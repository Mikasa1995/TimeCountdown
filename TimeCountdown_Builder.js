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
      .row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    </style>
    <div class="field">
      <label>目标日期 (ISO格式)</label>
      <input id="dateInput" type="text" placeholder="2026-12-31T23:59:59" />
    </div>
    <div class="field">
      <label>前缀文案</label>
      <input id="prefixInput" type="text" placeholder="距项目上线还剩" />
    </div>
    <div class="field">
      <label>前缀文案颜色</label>
      <input id="prefixColorInput" type="color" />
    </div>
    <div class="field">
      <label>倒计时颜色</label>
      <input id="countdownColorInput" type="color" />
    </div>
    <div class="field">
      <label>背景颜色</label>
      <input id="bgColorInput" type="color" />
    </div>
    <div class="field">
      <label>倒计时结束文案</label>
      <input id="captionInput" type="text" placeholder="项目已上线" />
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
      setVal("#prefixInput", this._props.prefixText, "距项目上线还剩");
      setVal("#prefixColorInput", this._props.prefixColor, "#cccccc");
      setVal("#countdownColorInput", this._props.countdownColor, "#ffffff");
      setVal("#bgColorInput", this._props.backgroundColor, "#333333");
      setVal("#captionInput", this._props.captionaftercountdown, "项目已上线");
    }
  }

  customElements.define(
    "com-mikasa1995-sap-timecountdown-builder",
    CountdownBuilder
  );
})();
