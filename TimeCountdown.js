(function() {
  let template = document.createElement("template");
  template.innerHTML = `
    <style>
      #time_div {
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        color: #fff;
        background-color: #333;
        padding: 10px;
        border-radius: 5px;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }
      #countdown {
        white-space: nowrap;
        line-height: 1;
      }
    </style>
    <div id="time_div">
      <span id="countdown"></span>
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
      const countdownEl = this.shadowRoot.querySelector("#countdown");
      if (!countdownEl) return;

      const width = this.clientWidth;
      const height = this.clientHeight;
      if (width === 0 || height === 0) return;

      // 文本内容，用于估算字符数
      const text = countdownEl.textContent || "00d 00h 00m 00s";
      const charCount = text.length;

      // 按宽度约束：字符平均宽度约等于字号的 0.6 倍
      const fontSizeByWidth = width / (charCount * 0.6);

      // 按高度约束：字号不超过容器高度的 60%
      const fontSizeByHeight = height * 0.6;

      // 取两者中较小的，保证文本既不出宽度也不出高度
      const fontSize = Math.min(fontSizeByWidth, fontSizeByHeight);

      countdownEl.style.fontSize = fontSize + "px";
    }

    async initMain() {
      const date = this._props.date;
      const caption = this._props.captionaftercountdown;
      const countdownEl = this.shadowRoot.querySelector("#countdown");

      if (this._countdownInterval) {
        clearInterval(this._countdownInterval);
      }

      const updateCountdown = () => {
        const timeRemaining = Date.parse(date) - Date.parse(new Date());
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);
        countdownEl.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        if (timeRemaining < 0) {
          countdownEl.innerHTML = caption;
        }

        // 每次更新文本后重新计算字号（因为字符数可能变化）
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
    "com-rohitchouhan-sap-timecountdown",
    CountdownWidget
  );
})();
