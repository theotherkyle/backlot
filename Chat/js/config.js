var chat;
(function (chat) {
    var Config = /** @class */ (function () {
        function Config() {
        }
        Config.getRegion = function () {
            return this._region;
        };
        Config.setRegion = function (region) {
            this._region = region;
        };
        Config.getGatewayUrl = function () {
            return this._gatewayUrl;
        };
        Config.setGatewayUrl = function (gatewayUrl) {
            this._gatewayUrl = gatewayUrl;
        };
        Config.getSharedSecret = function () {
            return this._sharedSecret;
        };
        Config.setSharedSecret = function (sharedSecret) {
            this._sharedSecret = sharedSecret;
        };
        Config._region = null;
        Config._gatewayUrl = 'https://demo.liveswitch.fm:8443/sync';
        Config._sharedSecret = '--replaceThisWithYourOwnSharedSecret--';
        return Config;
    }());
    chat.Config = Config;
})(chat || (chat = {}));
