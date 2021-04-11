var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var chat;
(function (chat) {
    var ContextMenu = /** @class */ (function (_super) {
        __extends(ContextMenu, _super);
        function ContextMenu() {
            return _super.call(this) || this;
        }
        Object.defineProperty(ContextMenu.prototype, "element", {
            get: function () {
                return this._menuElement;
            },
            enumerable: false,
            configurable: true
        });
        ContextMenu.prototype.bindTo = function (target) {
            var _this = this;
            var delay;
            var that = this;
            target.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                _this.showMenu(e.pageX, e.pageY);
                var onMouseDown = function () {
                    _this.hideMenu();
                    document.removeEventListener('mousedown', onMouseDown);
                };
                document.addEventListener('mousedown', onMouseDown, false);
            }, false);
            target.addEventListener('touchstart', function (e) {
                e.preventDefault();
                delay = setTimeout(function () {
                    that.showMenu(e.touches[0].pageX, e.touches[0].pageY);
                }, 800);
                var touchStart = function () {
                    _this.hideMenu();
                    document.removeEventListener('touchstart', touchStart);
                };
                document.addEventListener('touchstart', touchStart, false);
            }, false);
            target.addEventListener('touchend', function (e) {
                e.preventDefault();
                clearTimeout(delay);
                var touchEnd = function () {
                    document.removeEventListener('touchend', touchEnd);
                };
                document.addEventListener('touchend', touchEnd, false);
            }, false);
        };
        ContextMenu.prototype.showMenu = function (x, y) {
            document.body.appendChild(this.element);
            this.element.style.left = x + 'px';
            this.element.style.top = y + 'px';
            this.element.classList.add('menu-show');
        };
        ContextMenu.prototype.hideMenu = function () {
            this.element.classList.remove('menu-show');
            document.body.removeChild(this.element);
        };
        return ContextMenu;
    }(chat.Menu));
    chat.ContextMenu = ContextMenu;
})(chat || (chat = {}));
