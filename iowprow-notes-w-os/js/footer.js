customElements.define('footer-component',
    class Footer extends HTMLElement {

        constructor() {
            super()
        }

        connectedCallback() {
            this.render();
        }

        render() {
            let date = new Date();
            let currentYear = date.getFullYear();
            this.innerHTML = `
            <style>
                footer {
                    background-color: #fd9644;
                    min-height: 20px;
                    padding: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
            </style>
            <footer>
                <div class="left">
                    <small>&copy; <span id="year">${currentYear}</span> iowprow</small>
                </div>
                <div class="right">Ramblers PROW</div>
            </footer>
            `
        }
    }
)
