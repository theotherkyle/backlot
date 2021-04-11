namespace chat {
    export class MenuItem extends Menu {
        private _element: HTMLElement;
        private _buttonElement: HTMLButtonElement;
        private _iconElement: HTMLElement;
        private _spanElement: HTMLSpanElement;
        private _expandElement: HTMLSpanElement;
        public get element(): HTMLElement {
            return this._element;
        }

        private _text: string;
        public get text(): string {
            return this._text;
        }

        private _onClick: (sender: MenuItem) => any;
        public get onClick(): (sender: MenuItem) => any {
            return this._onClick;
        }

        private _disabled: boolean;
        public get disabled(): boolean {
            return this._disabled;
        }
        public set disabled(value: boolean) {
            if (value) {
                this._element.classList.add(this.disabledClass);
            } else {
                this._element.classList.remove(this.disabledClass);
            }
            this._disabled = value;
        }

        private _id: string;
        public get id(): string {
            return this._id;
        }
        public set id(value: string) {
            this._id = value;
        }

        private _checked: boolean;
        public get checked(): boolean {
            return this._checked;
        }
        public set checked(value: boolean) {
            this._checked = value;
            this.updateChecked();
        }

        private _radioCheck: boolean;
        public get radioCheck(): boolean {
            return this._radioCheck;
        }
        public set radioCheck(value: boolean) {
            this._radioCheck = value;
            this.updateChecked();
        }

        private _index: number;
        public get index(): number {
            return this._index;
        }
        public set index(value: number) {
            this._index = value;
        }

        private _parent: Menu;
        public get parent(): Menu {
            return this._parent;
        }
        public set parent(value: Menu) {
            this._parent = value;
        }

        private readonly checkClass = 'fa-check';
        private readonly radioClass = 'fa-dot-circle';
        private readonly disabledClass = 'menu-item-disabled';

        public constructor(text: string);
        public constructor(text: string, onClick: (sender: MenuItem) => any);
        public constructor(text: string, menuItems: MenuItem[]);
        public constructor() {
            super();
            if (arguments.length >= 1) {
                this._text = <string>arguments[0];
            }
            this._element = document.createElement('li');
            if (this._text == '-') {
                this._element.className = 'menu-separator';
            } else {
                this._element.className = 'menu-item';
                this._buttonElement = document.createElement('button');
                this._buttonElement.type = 'button';
                this._buttonElement.className = 'menu-btn';
                this._element.appendChild(this._buttonElement);
                this._iconElement = document.createElement('i');
                this._iconElement.className = 'menu-icon fa';
                this._buttonElement.appendChild(this._iconElement);
                this._spanElement = document.createElement('span');
                this._spanElement.className = 'menu-text';
                this._spanElement.innerHTML = this._text;
                this._buttonElement.appendChild(this._spanElement);
                this._expandElement = document.createElement('i');
                this._expandElement.className = 'menu-expand fa';
                this._buttonElement.appendChild(this._expandElement);
            }
            if (arguments.length >= 2) {
                if (typeof arguments[1] == 'function') {
                    this._onClick = <(sender: MenuItem) => any>arguments[1];
                    if (this._onClick && this._buttonElement) {
                        this._buttonElement.addEventListener('mousedown', () => {
                            if (!this.disabled) {
                                this._onClick(this);
                            }
                        });
                    }
                } else {
                    let menuItems = <MenuItem[]>arguments[1];
                    if (menuItems && menuItems.length > 0) {
                        for (let menuItem of <MenuItem[]>arguments[1]) {
                            this.addMenuItem(menuItem);
                        }
                        this._element.appendChild(this._menuElement);
                        this._expandElement.classList.add('fa-chevron-right');
                    } else {
                        this.disabled = true;
                    }
                }
            }
        }

        private updateChecked(): void {
            this._iconElement.classList.remove(this.checkClass);
            this._iconElement.classList.remove(this.radioClass);
            if (this.checked) {
                if (this.radioCheck) {
                    this._iconElement.classList.add(this.radioClass);
                } else {
                    this._iconElement.classList.add(this.checkClass);
                }
            }
        }
    }
}