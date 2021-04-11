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
    var MenuItem = /** @class */ (function (_super) {
        __extends(MenuItem, _super);
        function MenuItem() {
            var _this = _super.call(this) || this;
            _this.checkClass = 'fa-check';
            _this.radioClass = 'fa-dot-circle';
            _this.disabledClass = 'menu-item-disabled';
            if (arguments.length >= 1) {
                _this._text = arguments[0];
            }
            _this._element = document.createElement('li');
            if (_this._text == '-') {
                _this._element.className = 'menu-separator';
            }
            else {
                _this._element.className = 'menu-item';
                _this._buttonElement = document.createElement('button');
                _this._buttonElement.type = 'button';
                _this._buttonElement.className = 'menu-btn';
                _this._element.appendChild(_this._buttonElement);
                _this._iconElement = document.createElement('i');
                _this._iconElement.className = 'menu-icon fa';
                _this._buttonElement.appendChild(_this._iconElement);
                _this._spanElement = document.createElement('span');
                _this._spanElement.className = 'menu-text';
                _this._spanElement.innerHTML = _this._text;
                _this._buttonElement.appendChild(_this._spanElement);
                _this._expandElement = document.createElement('i');
                _this._expandElement.className = 'menu-expand fa';
                _this._buttonElement.appendChild(_this._expandElement);
            }
            if (arguments.length >= 2) {
                if (typeof arguments[1] == 'function') {
                    _this._onClick = arguments[1];
                    if (_this._onClick && _this._buttonElement) {
                        _this._buttonElement.addEventListener('mousedown', function () {
                            if (!_this.disabled) {
                                _this._onClick(_this);
                            }
                        });
                    }
                }
                else {
                    var menuItems = arguments[1];
                    if (menuItems && menuItems.length > 0) {
                        for (var _i = 0, _a = arguments[1]; _i < _a.length; _i++) {
                            var menuItem = _a[_i];
                            _this.addMenuItem(menuItem);
                        }
                        _this._element.appendChild(_this._menuElement);
                        _this._expandElement.classList.add('fa-chevron-right');
                    }
                    else {
                        _this.disabled = true;
                    }
                }
            }
            return _this;
        }
        Object.defineProperty(MenuItem.prototype, "element", {
            get: function () {
                return this._element;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MenuItem.prototype, "text", {
            get: function () {
                return this._text;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MenuItem.prototype, "onClick", {
            get: function () {
                return this._onClick;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MenuItem.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (value) {
                if (value) {
                    this._element.classList.add(this.disabledClass);
                }
                else {
                    this._element.classList.remove(this.disabledClass);
                }
                this._disabled = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MenuItem.prototype, "id", {
            get: function () {
                return this._id;
            },
            set: function (value) {
                this._id = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MenuItem.prototype, "checked", {
            get: function () {
                return this._checked;
            },
            set: function (value) {
                this._checked = value;
                this.updateChecked();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MenuItem.prototype, "radioCheck", {
            get: function () {
                return this._radioCheck;
            },
            set: function (value) {
                this._radioCheck = value;
                this.updateChecked();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MenuItem.prototype, "index", {
            get: function () {
                return this._index;
            },
            set: function (value) {
                this._index = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MenuItem.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            set: function (value) {
                this._parent = value;
            },
            enumerable: false,
            configurable: true
        });
        MenuItem.prototype.updateChecked = function () {
            this._iconElement.classList.remove(this.checkClass);
            this._iconElement.classList.remove(this.radioClass);
            if (this.checked) {
                if (this.radioCheck) {
                    this._iconElement.classList.add(this.radioClass);
                }
                else {
                    this._iconElement.classList.add(this.checkClass);
                }
            }
        };
        return MenuItem;
    }(chat.Menu));
    chat.MenuItem = MenuItem;
})(chat || (chat = {}));
