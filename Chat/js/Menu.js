var chat;
(function (chat) {
    var Menu = /** @class */ (function () {
        function Menu() {
            this._menuItems = [];
            this._menuElement = document.createElement('ul');
            this._menuElement.className = 'menu';
        }
        Object.defineProperty(Menu.prototype, "menuItems", {
            get: function () {
                return this._menuItems;
            },
            enumerable: false,
            configurable: true
        });
        Menu.prototype.addMenuItem = function (item) {
            this._menuItems.push(item);
            item.index = this._menuItems.length - 1;
            item.parent = this;
            this._menuElement.appendChild(item.element);
        };
        return Menu;
    }());
    chat.Menu = Menu;
})(chat || (chat = {}));
