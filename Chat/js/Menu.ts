namespace chat {
    export abstract class Menu {
        protected _menuItems: MenuItem[] = [];
        public get menuItems(): MenuItem[] {
            return this._menuItems;
        }

        protected _menuElement: HTMLUListElement;

        public constructor() {
            this._menuElement = document.createElement('ul');
            this._menuElement.className = 'menu';
        }

        public addMenuItem(item: MenuItem) {
            this._menuItems.push(item);
            item.index = this._menuItems.length - 1;
            item.parent = this;
            this._menuElement.appendChild(item.element);
        }
    }
}