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
       // Config._gatewayUrl = 'https://demo.liveswitch.fm:8443/sync';
       // Config._sharedSecret = '--replaceThisWithYourOwnSharedSecret--';
        Config._gatewayUrl = 'https://cloud.liveswitch.io';
        Config._sharedSecret = '0992f824742c41ff858ff3d61991be9fae5f93be2fcb41a7b941c729163946fc';
        return Config;
    }());
    chat.Config = Config;
})(chat || (chat = {}));
