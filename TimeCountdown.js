(function() {
  let template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      #time_div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 4px;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
        padding: 10px;
        border-radius: 5px;
      }
      #prefix {
        white-space: nowrap;
        line-height: 1.2;
        font-weight: 500;
      }
      #countdown {
        white-space: nowrap;
        line-height: 1;
        font-weight: bold;
      }
    </style>
    <div id="time_div">
      <div id="prefix"></div>
      <div id="countdown"></div>
    </div>
  `;

  class CountdownWidget extends HTMLElement {
    constructor() {
      super();
      let shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {};
      this._countdownInterval = null;
      this._resizeObserver = null;
    }

    async connectedCallback() {
      this.initMain();
      this._setupResizeObserver();
    }

    disconnectedCallback() {
      if (this._countdownInterval) {
        clearInterval(this._countdownInterval);
        this._countdownInterval = null;
      }
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
      }
    }

    _setupResizeObserver() {
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
      }
      this._resizeObserver = new ResizeObserver(() => {
        this._adjustFontSize();
      });
      this._resizeObserver.observe(this);
    }

    _adjustFontSize() {
      const width = this.clientWidth;
      const height = this.clientHeight;
      if (width === 0 || height === 0) return;

      const prefixEl = this.shadowRoot.querySelector("#prefix");
      const countdownEl = this.shadowRoot.querySelector("#countdown");
      if (!prefixEl || !countdownEl) return;

      const gap = 4;
      const padding = 20;
      const availableHeight = height - padding - gap;

      const prefixRatio = 0.35;
      const countdownRatio = 0.65;

      const prefixLen = (prefixEl.textContent || "").length || 1;
      const countdownLen = (countdownEl.textContent || "").length || 1;

      const fontSizeByWidthPrefix = width / (prefixLen * 0.6);
      const fontSizeByWidthCountdown = width / (countdownLen * 0.6);

      const fontSizeByHeightPrefix = availableHeight * prefixRatio;
      const fontSizeByHeightCountdown = availableHeight * countdownRatio;

      const prefixFontSize = Math.min(fontSizeByWidthPrefix, fontSizeByHeightPrefix);
      const countdownFontSize = Math.min(fontSizeByWidthCountdown, fontSizeByHeightCountdown);

      prefixEl.style.fontSize = prefixFontSize + "px";
      countdownEl.style.fontSize = countdownFontSize + "px";
    }

    async initMain() {
      const date = this._props.date || this.getAttribute("date") || "2099-01-01T00:00";
      const caption = this._props.captionaftercountdown || this.getAttribute("captionaftercountdown") || "Project is live";
      const prefixText = this._props.prefixText || this.getAttribute("prefixText") || "Time until go-live";
      const prefixColor = this._props.prefixColor || this.getAttribute("prefixColor") || "#cccccc";
      const countdownColor = this._props.countdownColor || this.getAttribute("countdownColor") || "#ffffff";
      const backgroundColor = this._props.backgroundColor || this.getAttribute("backgroundColor") || "#333333";

      const prefixEl = this.shadowRoot.querySelector("#prefix");
      const countdownEl = this.shadowRoot.querySelector("#countdown");
      const divEl = this.shadowRoot.querySelector("#time_div");

      prefixEl.textContent = prefixText;
      prefixEl.style.color = prefixColor;
      countdownEl.style.color = countdownColor;
      divEl.style.backgroundColor = backgroundColor;

      if (this._countdownInterval) {
        clearInterval(this._countdownInterval);
      }

      const updateCountdown = () => {
        const timeRemaining = Date.parse(date) - Date.parse(new Date());

        if (isNaN(timeRemaining)) {
          countdownEl.innerHTML = "Invalid date format";
        } else if (timeRemaining < 0) {
          countdownEl.innerHTML = caption;
        } else {
          const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
          const seconds = Math.floor((timeRemaining / 1000) % 60);
          countdownEl.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        this._adjustFontSize();
      };

      updateCountdown();
      this._countdownInterval = setInterval(updateCountdown, 1000);
    }

    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = { ...this._props, ...changedProperties };
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      this.initMain();
    }
  }

  customElements.define(
    "com-mikasa1995-sap-timecountdown",
    CountdownWidget
  );
})();
