namespace chat {
    export class ContextMenu extends Menu {
        public get element(): HTMLElement {
            return this._menuElement;
        }

        public constructor() {
            super();
        }

        public bindTo(target: HTMLElement): void {
            var delay: number;
            var that = this;
            target.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showMenu(e.pageX, e.pageY);
                let onMouseDown = () => {
                    this.hideMenu();
                    document.removeEventListener('mousedown', onMouseDown);
                };
                document.addEventListener('mousedown', onMouseDown, false);
            }, false);

            target.addEventListener('touchstart', (e) => {
                e.preventDefault();
                delay = setTimeout(function () {
                    that.showMenu(e.touches[0].pageX, e.touches[0].pageY);
                }, 800);
                let touchStart = () => {
                    this.hideMenu();
                    document.removeEventListener('touchstart', touchStart);
                };
                document.addEventListener('touchstart', touchStart, false);
            }, false);

            target.addEventListener('touchend', (e) => {
                e.preventDefault();
                clearTimeout(delay);
                let touchEnd = () => {
                    document.removeEventListener('touchend', touchEnd);
                };
                document.addEventListener('touchend', touchEnd, false);
            }, false);
        }

        private showMenu(x: number, y: number): void {
            document.body.appendChild(this.element);
            this.element.style.left = x + 'px';
            this.element.style.top = y + 'px';
            this.element.classList.add('menu-show');
        }

        private hideMenu() {
            this.element.classList.remove('menu-show');
            document.body.removeChild(this.element);
        }
    }
}