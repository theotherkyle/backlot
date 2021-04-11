namespace chat {
    export class Config {
        private static _region: string = null;
        private static _gatewayUrl: string = 'https://demo.liveswitch.fm:8443/sync';
        private static _sharedSecret: string = '--replaceThisWithYourOwnSharedSecret--';
        public static getRegion(): string {
            return this._region;
        }
        public static setRegion(region: string) {
            this._region = region;
        }
        public static getGatewayUrl(): string {
            return this._gatewayUrl;
        }
        public static setGatewayUrl(gatewayUrl: string) {
            this._gatewayUrl = gatewayUrl;
        }
        public static getSharedSecret(): string {
            return this._sharedSecret;
        }
        public static setSharedSecret(sharedSecret: string) {
            this._sharedSecret = sharedSecret;
        }
    }
}