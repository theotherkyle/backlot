/// <reference path="./config.ts" />
namespace chat {
    export enum Mode {
        Sfu = 1,
        Mcu = 2,
        Peer = 3
    }
    export class App {
        private channel: fm.liveswitch.Channel = null;
        private mcuConnection: fm.liveswitch.McuConnection = null;
        private sfuUpstreamConnection: fm.liveswitch.SfuUpstreamConnection = null;
        private sfuDownstreamConnections: fm.liveswitch.Hash<string, fm.liveswitch.SfuDownstreamConnection> = {};
        private peerConnections: fm.liveswitch.Hash<string, fm.liveswitch.PeerConnection> = {};
        private remoteMediaMaps: fm.liveswitch.Hash<string, fm.liveswitch.ManagedConnection> = {};
        private localMedia: fm.liveswitch.LocalMedia = null;
        private layoutManager: fm.liveswitch.DomLayoutManager = null;
        private videoLayout: fm.liveswitch.VideoLayout = null;
        private audioOnly: boolean = false;
        private receiveOnly: boolean = false;
        private simulcast: boolean = false;
        private enableOpusStereo = false;
        public incomingMessage: fm.liveswitch.IAction2<string, string>;
        public localContextMenu: ContextMenu = null;

        // Track whether the user has decided to leave (unregister)
        // If they have not and the client gets into the Disconnected state then we attempt to reregister (reconnect) automatically.
        private unRegistering: boolean = false;
        private reRegisterBackoff: number = 200;
        private maxRegisterBackoff: number = 60000;

        public mode: Mode; // set by index.ts

        public applicationId: string = 'my-app-id';
        public channelId: string = null; // set by index.ts
        public userId: string = fm.liveswitch.Guid.newGuid().toString().replace(/-/g, '');
        public deviceId: string = fm.liveswitch.Guid.newGuid().toString().replace(/-/g, '');
        public userName: string = null;
        private mcuViewId: string = null;
        public dataChannelsSupported: boolean = true;

        public opusDisabled: boolean = false;
        public g722Disabled: boolean = false;
        public pcmuDisabled: boolean = false;
        public pcmaDisabled: boolean = false;
        public vp8Disabled: boolean = false;
        public vp9Disabled: boolean = false;
        public h264Disabled: boolean = false;
        public h265Disabled: boolean = false;

        private client: fm.liveswitch.Client = null;

        private chromeExtensionInstallButton: HTMLButtonElement;
        private dataChannelConnected: boolean;
        private dataChannels: fm.liveswitch.DataChannel[] = [];


        public videoHeight: number = 480;
        public videoWidth: number = 640;
        public videoFps: number = 30;
        
        public constructor(logContainer: HTMLElement) {
            this.chromeExtensionInstallButton = document.getElementById('chromeExtensionInstallButton') as HTMLButtonElement;

            // Log to console and the DOM.
            fm.liveswitch.Log.registerProvider(new fm.liveswitch.ConsoleLogProvider(fm.liveswitch.LogLevel.Debug));
            fm.liveswitch.Log.registerProvider(new fm.liveswitch.DomLogProvider(logContainer, fm.liveswitch.LogLevel.Debug));
        }

        public setUserName(userName: string): void {
            this.userName = userName;
        }

        public startLocalMedia(videoContainer: HTMLElement, captureScreen: boolean, audioOnly: boolean, receiveOnly: boolean, simulcast: boolean, audioDeviceList: HTMLSelectElement, videoDeviceList: HTMLSelectElement): fm.liveswitch.Future<any> {
            let promise = new fm.liveswitch.Promise();
            try {
                if (this.localMedia != null) {
                    throw new Error("Local media has already been started.");
                }
                this.audioOnly = audioOnly;
                this.receiveOnly = receiveOnly;

                this.simulcast = simulcast;

                var pluginConfig = new fm.liveswitch.PluginConfig();
                pluginConfig.setActiveXPath("./FM.LiveSwitch.ActiveX.cab");

                fm.liveswitch.Plugin.install(pluginConfig).then((result) => {
                    
                    // Check if this browser is supported with local media (if not receive-only).
                    if (!fm.liveswitch.Plugin.isReady(!this.receiveOnly)) {
                        // Check if this browser is supported without local media.
                        if (fm.liveswitch.Plugin.isReady()) {
                            promise.reject(new Error('This browser supports WebRTC, but does not support media capture.\nTry receive-only mode!'));
                        } else {
                            promise.reject(new Error('This browser does not support WebRTC, and no plugin could be found.'));
                        }
                        return;
                    }

                    // Set up the layout manager.
                    this.layoutManager = new fm.liveswitch.DomLayoutManager(videoContainer);

                    // Set up the local media.
                    let audio: any = true;
                    if (fm.liveswitch.Util.isChrome() && this.enableOpusStereo) {
                        // Work around to enable stereo microphone for chrome bug.
                        // Note this disables echoCancellation.
                        // https://bugs.chromium.org/p/webrtc/issues/detail?id=8133
                        audio = {
                            echoCancellation: false,
                            noiseSuppression: false,
                            channelCount: 2
                        };
                    }
                    if (audioDeviceList) {
                        audioDeviceList.options.length = 0;
                    }
                    if (videoDeviceList) {
                        videoDeviceList.options.length = 0;
                    }

                    if (!this.receiveOnly) {
                        if (!this.audioOnly) {
                            let video = captureScreen ? new fm.liveswitch.VideoConfig(window.screen.width, window.screen.height, 3) : new fm.liveswitch.VideoConfig(this.videoWidth, this.videoHeight, this.videoFps);
                            this.localMedia = new fm.liveswitch.LocalMedia(audio, video, captureScreen);
                            
                            if (this.simulcast) {
                                this.localMedia.setVideoSimulcastDisabled(!this.simulcast);
                            }
                        } else {
                            this.localMedia = new fm.liveswitch.LocalMedia(audio, null, captureScreen);
                        }

                        // Start the local media.
                        this.localMedia.start().then((o) => {

                            // Audio device selection.
                            if (audioDeviceList) {
                                audioDeviceList.options.length = 0;
                                let currentAudioSourceInput = this.localMedia.getAudioSourceInput();
                                this.localMedia.getAudioSourceInputs().then((inputs) => {
                                    for (var input of inputs) {
                                        var option = document.createElement('option');
                                        option.value = input.getId();
                                        option.text = input.getName();
                                        option.selected = (currentAudioSourceInput != null && currentAudioSourceInput.getId() == input.getId());
                                        audioDeviceList.add(option);
                                    }
                                });
                            }
                        
                            // Video device selection.
                            if (videoDeviceList) {
                                videoDeviceList.options.length = 0;
                                if (!audioOnly && !captureScreen) {
                                    let currentVideoSourceInput = this.localMedia.getVideoSourceInput();
                                    this.localMedia.getVideoSourceInputs().then((inputs) => {
                                        for (var input of inputs) {
                                            var option = document.createElement('option');
                                            option.value = input.getId();
                                            option.text = input.getName();
                                            option.selected = (currentVideoSourceInput != null && currentVideoSourceInput.getId() == input.getId());
                                            videoDeviceList.add(option);
                                        }
                                    });
                                }
                            }

                            if (!audioOnly) {
                                var localView = this.localMedia.getView();
                                if (localView != null) {
                                    localView.id = 'localView';
                                    
                                    this.layoutManager.setLocalView(localView);
                                    // Set up the Context Menu
                                    this.localContextMenu = this.createLocalContextMenu(this.localMedia.getVideoEncodings());
                                    this.localContextMenu.bindTo(localView);
                                }
                            }

                            promise.resolve(null);
                        }, (ex) => {
                            if (audioOnly) {
                                promise.reject(ex);
                            } else if (captureScreen && fm.liveswitch.Plugin.getChromeExtensionRequired() && !fm.liveswitch.Plugin.getChromeExtensionInstalled()) {
                                this.chromeExtensionInstallButton.removeAttribute('class');
                                promise.reject(new Error(ex + '\n\nClick "Install Screen-Sharing Extension" to install screen-sharing extension.'));
                            } else if (captureScreen) {
                                promise.reject(ex);
                            } else {
                                // Try with a static image since a camera may not be available.
                                let canvas = document.getElementById('localCanvasSource') as HTMLCanvasElement;
                                let canvasFrameRate = 3;
                                if (!canvas) {

                                    // Create the canvas if it doesn't exist yet.
                                    canvas = document.createElement('canvas') as HTMLCanvasElement;
                                    canvas.id = 'localCanvasSource';
                                    canvas.style.position = 'absolute';
                                    document.body.appendChild(canvas);
                                
                                    // Load a static image.
                                    let image = new Image();
                                    image.onload = () => {

                                        // Resize the canvas to match the image size.
                                        canvas.width = image.width;
                                        canvas.height = image.height;
                                        canvas.style.left = '-' + image.width + 'px';
                                        canvas.style.top = '-' + image.height + 'px';

                                        // Draw the initial image.
                                        let context = canvas.getContext('2d');
                                        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

                                        // Refresh the image on a regular interval.
                                        window.setInterval(() => {
                                            context.clearRect(0, 0, canvas.width, canvas.height);
                                            context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
                                        }, 1000.0 / canvasFrameRate);
                                    };
                                    image.src = 'images/static.jpg';
                                }

                                // try local media with stream
                                let canvasStream = (canvas as any).captureStream(canvasFrameRate);
                                this.localMedia = new fm.liveswitch.LocalMedia(audio, canvasStream, false);
                                this.localMedia.start().then((o) => {
                                    var localView = this.localMedia.getView();
                                    if (localView != null) {
                                        this.layoutManager.setLocalView(localView);
                                        
                                    }
                                    promise.resolve(null);
                                }, (ex) => {
                                    promise.reject(ex);
                                });
                            }
                        });
                    } else {
                        // Handle Safari permissions handling bug when it is receive-only
                        if (fm.liveswitch.Util.isSafari()) {
                            this.localMedia = new fm.liveswitch.LocalMedia(true, false);
                            this.localMedia.start().then(function (lm: fm.liveswitch.LocalMedia) {
                                if (fm.liveswitch.Util.isiOS()) {
                                    // Safari iOS and iPadOS requires local media access to play audio
                                    // Audio will not be sent to remote clients but muting the mic as a precautionary measure
                                    lm.setAudioMuted(true);
                                    promise.resolve(null);
                                }
                                else {
                                    // Safari (not iOS) requires to start then stop the local media to play audio
                                    lm.stop().then(function (x: fm.liveswitch.LocalMedia) {
                                        // Tear down the local media.
                                        if (this.localMedia != null) {
                                            this.localMedia.destroy();
                                            this.localMedia = null;
                                        }
                                        promise.resolve(null);
                                    }, function (ex) {
                                        promise.reject(ex);
                                    });
                                }
                            }, function (ex) {
                                promise.reject(ex);
                            })
                        } else {
                            promise.resolve(null);
                        }
                    };
                }, (ex) => {
                    promise.reject(ex);
                });
            } catch (ex) {
                promise.reject(ex);
            }
            return promise;
        }

        public stopLocalMedia(): fm.liveswitch.Future<any> {
            let promise = new fm.liveswitch.Promise();
            try {
                if (this.localMedia == null) {
                    promise.resolve(null);
                    return promise;
                }

                this.localMedia.stop().then((o) => {
                    // Tear down the layout manager.
                    var lm = this.layoutManager;
                    if (lm != null) {
                        lm.removeRemoteViews();
                        lm.unsetLocalView();
                        this.layoutManager = null;
                    }

                    // Tear down the local media.
                    if (this.localMedia != null) {
                        this.localMedia.destroy();
                        this.localMedia = null;
                    }

                    promise.resolve(null);
                }, (ex) => {
                    promise.reject(ex);
                });
            } catch (ex) {
                promise.reject(ex);
            }
            return promise;
        };

        public sendMessage(text: string): void {
            let channel = this.channel;
            if (channel != null) { // If the registration has not completed, then "channel" will be null. So we want register and then send a message.
                channel.sendMessage(text);
            }
        }

        // Generate a joinAsync token.
        // WARNING: do NOT do this here!
        // Tokens should be generated by a secure server that
        // has authenticated your user identity and is authorized
        // to allow you to joinAsync with the LiveSwitch server.
        private _generateToken(claims: fm.liveswitch.ChannelClaim[]): string {
            let region = Config.getRegion();
            if (region) {
                return fm.liveswitch.Token.generateClientRegisterToken(
                    this.applicationId, this.client.getUserId(), this.client.getDeviceId(), this.client.getId(), null, claims, Config.getSharedSecret(), region
                );
            } else {
                return fm.liveswitch.Token.generateClientRegisterToken(
                    this.applicationId, this.client.getUserId(), this.client.getDeviceId(), this.client.getId(), null, claims, Config.getSharedSecret()
                );
            }
        }

        public joinAsync(
            incomingMessage: fm.liveswitch.IAction2<string, string>,
            peerLeft: (name: string) => void,
            peerJoined: (name: string) => void,
            clientRegistered: () => void): fm.liveswitch.Future<Object> {

            let promise = new fm.liveswitch.Promise();
            this.unRegistering = false;

            // Create a client to manage the channel.
            this.client = new fm.liveswitch.Client(Config.getGatewayUrl(), this.applicationId, this.userId, this.deviceId);
            let claims = [new fm.liveswitch.ChannelClaim(this.channelId)];

            // Use the optional tag field to indicate our mode.
            this.client.setTag(this.mode.toString());
            this.client.setUserAlias(this.userName);

            let token = this._generateToken(claims);

            this.client.addOnStateChange((client) => {
                if (client.getState() == fm.liveswitch.ClientState.Registering) {
                    fm.liveswitch.Log.debug("client is registering");
                }
                else if (client.getState() == fm.liveswitch.ClientState.Registered) {
                    fm.liveswitch.Log.debug("client is registered");
                }
                else if (client.getState() == fm.liveswitch.ClientState.Unregistering) {
                    fm.liveswitch.Log.debug("client is unregistering");
                }
                else if (client.getState() == fm.liveswitch.ClientState.Unregistered) {
                    fm.liveswitch.Log.debug("client is unregistered");

                    // Client has failed for some reason:
                    // We do not need to `c.closeAll()` as the client handled this for us as part of unregistering.
                    if (!this.unRegistering) {
                        let self = this;
                        setTimeout(function () {

                            // Back off our reregister attempts as they continue to fail to avoid runaway process.
                            if (self.reRegisterBackoff < self.maxRegisterBackoff) {
                                self.reRegisterBackoff += self.reRegisterBackoff;
                            }

                            // ReRegister
                            token = self._generateToken(claims);
                            self.client.register(token).then((channels: fm.liveswitch.Channel[]) => {
                                self.reRegisterBackoff = 200 // reset for next time
                                self.onClientRegistered(channels, incomingMessage, peerLeft, peerJoined, clientRegistered);
                            },  (ex: any) => {
                    fm.liveswitch.Log.error("Failed to register with Gateway.");
                promise.reject(ex);
                });
                        }, this.reRegisterBackoff);
                    }
                }
            });

            // Register with the server.
            this.client.register(token).then((channels: fm.liveswitch.Channel[]) => {
                this.onClientRegistered(channels, incomingMessage, peerLeft, peerJoined, clientRegistered);
                promise.resolve(null);
            }, (ex: any) => {
                    fm.liveswitch.Log.error("Failed to register with Gateway.");
                promise.reject(ex);
                });

            return promise;
        }

        private onClientRegistered(
            channels: fm.liveswitch.Channel[],
            incomingMessage: fm.liveswitch.IAction2<string, string>,
            peerLeft: (name: string) => void,
            peerJoined: (name: string) => void,
            clientRegistered: () => void): void {

            this.channel = channels[0];

            // Monitor the channel remote client changes.
            this.channel.addOnRemoteClientJoin((remoteClientInfo: fm.liveswitch.ClientInfo) => {
                fm.liveswitch.Log.info('Remote client joined the channel (client ID: ' +
                    remoteClientInfo.getId() + ', device ID: ' + remoteClientInfo.getDeviceId() +
                    ', user ID: ' + remoteClientInfo.getUserId() + ', tag: ' + remoteClientInfo.getTag() + ').');

                let n: string = remoteClientInfo.getUserAlias() != null ? remoteClientInfo.getUserAlias() : remoteClientInfo.getUserId();
                peerJoined(n);
            });
            this.channel.addOnRemoteClientLeave((remoteClientInfo: fm.liveswitch.ClientInfo) => {
                let n: string = remoteClientInfo.getUserAlias() != null ? remoteClientInfo.getUserAlias() : remoteClientInfo.getUserId();
                peerLeft(n);

                fm.liveswitch.Log.info('Remote client left the channel (client ID: ' + remoteClientInfo.getId() +
                    ', device ID: ' + remoteClientInfo.getDeviceId() + ', user ID: ' + remoteClientInfo.getUserId() +
                    ', tag: ' + remoteClientInfo.getTag() + ').');
            });
            // Monitor the channel remote upstream connection changes.
            this.channel.addOnRemoteUpstreamConnectionOpen((remoteConnectionInfo: fm.liveswitch.ConnectionInfo) => {
                fm.liveswitch.Log.info('Remote client opened upstream connection (connection ID: ' +
                    remoteConnectionInfo.getId() + ', client ID: ' + remoteConnectionInfo.getClientId() + ', device ID: ' +
                    remoteConnectionInfo.getDeviceId() + ', user ID: ' + remoteConnectionInfo.getUserId() + ', tag: ' +
                    remoteConnectionInfo.getTag() + ').');
                if (this.mode == Mode.Sfu) {
                    // Open downstream connection to receive the new upstream connection.
                    this.openSfuDownstreamConnection(remoteConnectionInfo);
                }
            });
            this.channel.addOnRemoteUpstreamConnectionClose((remoteConnectionInfo: fm.liveswitch.ConnectionInfo) => {
                fm.liveswitch.Log.info('Remote client closed upstream connection (connection ID: ' + remoteConnectionInfo.getId() +
                    ', client ID: ' + remoteConnectionInfo.getClientId() + ', device ID: ' + remoteConnectionInfo.getDeviceId() +
                    ', user ID: ' + remoteConnectionInfo.getUserId() + ', tag: ' + remoteConnectionInfo.getTag() + ').');
            });
            // Monitor the channel peer connection offers.
            this.channel.addOnPeerConnectionOffer((peerConnectionOffer: fm.liveswitch.PeerConnectionOffer) => {
                // Accept the peer connection offer.
                this.openPeerAnswerConnection(peerConnectionOffer);
            });
            this.channel.addOnMessage((client: fm.liveswitch.ClientInfo, message: string) => {
                if (incomingMessage == null)
                    return;

                let n: string = client.getUserAlias() != null ? client.getUserAlias() : client.getUserId();
                incomingMessage(n, message);
            });

            if (this.mode == Mode.Mcu) {

                // Monitor the channel video layout changes.
                this.channel.addOnMcuVideoLayout((videoLayout) => {
                    if (!this.receiveOnly) {
                        this.videoLayout = videoLayout;

                        // Force a layout in case the local video preview needs to move.

                        var lm = this.layoutManager;
                        if (lm != null) {
                            lm.layout();
                        }
                    }
                });

                // Open an MCU connection.
                this.openMcuConnection();
            } else if (this.mode == Mode.Sfu) {
                if (!this.receiveOnly) {
                    // Open an upstream SFU connection.
                    this.openSfuUpstreamConnection();
                }
                // Open a downstream SFU connection for each remote upstream connection.
                for (let remoteConnectionInfo of this.channel.getRemoteUpstreamConnectionInfos()) {
                    this.openSfuDownstreamConnection(remoteConnectionInfo);
                }
            } else if (this.mode == Mode.Peer) {
                // Open a peer connection for each remote client.
                for (let remoteClientInfo of this.channel.getRemoteClientInfos()) {
                    this.openPeerOfferConnection(remoteClientInfo);
                }
            }
            clientRegistered();
            if (!this.dataChannelsSupported) {
                incomingMessage("System", "DataChannels not supported by browser");
            }
        }


        public leaveAsync(clientUnregistered: () => void): fm.liveswitch.Future<Object> {
            this.dataChannelConnected = false;
            if (this.client != null) {
                this.unRegistering = true;
                // Unregister with the server.
                return this.client.unregister().then(() => {
                    clientUnregistered();
                }).fail(() => {
                    fm.liveswitch.Log.debug("Failed to unregister client.");
                });
            } else {
                return fm.liveswitch.Promise.resolveNow(null);
            }
        }


        private openMcuConnection(tag?: string): fm.liveswitch.McuConnection {
            // Create remote media to manage incoming media.
            let remoteMedia = new fm.liveswitch.RemoteMedia();
            remoteMedia.setAudioMuted(false);
            remoteMedia.setVideoMuted(this.audioOnly);
            this.mcuViewId = remoteMedia.getId();

            // Add the remote video view to the layout.
            if (remoteMedia.getView()) {
                remoteMedia.getView().id = 'remoteView_' + remoteMedia.getId();
            }
            this.layoutManager.addRemoteView(remoteMedia.getId(), remoteMedia.getView());

            let connection: fm.liveswitch.McuConnection;
            let dataChannel: fm.liveswitch.DataChannel = null;
            let dataStream: fm.liveswitch.DataStream = null;
            if (this.dataChannelsSupported) {
                dataChannel = this.prepareDataChannel();
                dataStream = new fm.liveswitch.DataStream(dataChannel);
                this.dataChannels.push(dataChannel);
            }

            let audioStream = new fm.liveswitch.AudioStream(this.localMedia, remoteMedia);
            if (this.receiveOnly) {
                audioStream.setLocalDirection(fm.liveswitch.StreamDirection.ReceiveOnly);
            }
            if (this.audioOnly) {
                connection = this.channel.createMcuConnection(audioStream, dataStream);
            }
            else {
                let videoStream = new fm.liveswitch.VideoStream(this.localMedia, remoteMedia);
                if (this.receiveOnly) {
                    videoStream.setLocalDirection(fm.liveswitch.StreamDirection.ReceiveOnly);
                }
                else if (this.simulcast && !this.audioOnly) {
                    videoStream.setSimulcastMode(fm.liveswitch.SimulcastMode.RtpStreamId);
                }
                connection = this.channel.createMcuConnection(audioStream, videoStream, dataStream);
            }

            this.prepareConnection(connection);

            this.mcuConnection = connection;
            this.enableStereoOpusOnChrome(connection);
            // Tag the connection (optional).
            if (tag == null) {
                tag = 'mcu';
            }
            connection.setTag(tag);

            /*
            Embedded TURN servers are used by default.  For more information refer to:
            https://help.frozenmountain.com/docs/liveswitch/server/advanced-topics#TURNintheMediaServer
            */

            // Monitor the connection state changes.
            connection.addOnStateChange((connection) => {
                fm.liveswitch.Log.info(connection.getId() + ': MCU connection state is ' + new fm.liveswitch.ConnectionStateWrapper(connection.getState()).toString() + '.');

                // Cleanup if the connection closes or fails.
                if (connection.getState() == fm.liveswitch.ConnectionState.Closing || connection.getState() == fm.liveswitch.ConnectionState.Failing) {
                    if (connection.getRemoteClosed()) {
                        fm.liveswitch.Log.info(connection.getId() + ': Media server closed the connection.');
                    }
                    // Remove the remote view from the layout.

                    var lm = this.layoutManager;
                    if (lm != null) {
                        lm.removeRemoteView(remoteMedia.getId());
                    }

                    remoteMedia.destroy();
                    this.mcuConnection = null;
                    this.logConnectionState(connection, "MCU");
                    if (this.dataChannelsSupported) {
                        this.dataChannels = this.dataChannels.filter(element => element !== dataChannel);
                    }
                }
                else if (connection.getState() == fm.liveswitch.ConnectionState.Failed) {
                    // Note: no need to close the connection as it's done for us.
                    this.openMcuConnection(tag);
                    this.logConnectionState(connection, "MCU");
                }
                else if (connection.getState() == fm.liveswitch.ConnectionState.Connected) {
                    this.logConnectionState(connection, "MCU");
                }
            });

            // Float the local preview over the mixed video feed for an improved user experience.
            this.layoutManager.addOnLayout((layout: fm.liveswitch.Layout) => {
                if (this.mcuConnection != null && !this.receiveOnly && !this.audioOnly) {
                    fm.liveswitch.LayoutUtility.floatLocalPreview(layout, this.videoLayout, this.mcuConnection.getId(), this.mcuViewId, this.localMedia.getVideoSink());
                }
            });

            // Open the connection.
            connection.open();

            return connection;
        }



        private openSfuUpstreamConnection(tag?: string): fm.liveswitch.SfuUpstreamConnection {

            let connection: fm.liveswitch.SfuUpstreamConnection;

            let dataChannel: fm.liveswitch.DataChannel = null;
            let dataStream: fm.liveswitch.DataStream = null;
            if (this.dataChannelsSupported) {
                dataChannel = this.prepareDataChannel();
                dataStream = new fm.liveswitch.DataStream(dataChannel);
                this.dataChannels.push(dataChannel);
            }

            let audioStream: fm.liveswitch.AudioStream;
            let videoStream: fm.liveswitch.VideoStream;


            if (this.localMedia.getAudioTrack() != null) {
                audioStream = new fm.liveswitch.AudioStream(this.localMedia);
            }

            if (this.localMedia.getVideoTrack() != null) {
                videoStream = new fm.liveswitch.VideoStream(this.localMedia);
                if (this.simulcast) {
                    videoStream.setSimulcastMode(fm.liveswitch.SimulcastMode.RtpStreamId);
                }
            }

            connection = this.channel.createSfuUpstreamConnection(audioStream, videoStream, dataStream);
            this.sfuUpstreamConnection = connection;
            this.prepareConnection(connection);
            this.enableStereoOpusOnChrome(connection);

            // Tag the connection (optional).
            if (tag == null) {
                tag = 'sfu-upstream';
            }
            connection.setTag(tag);

            /*
            Embedded TURN servers are used by default.  For more information refer to:
            https://help.frozenmountain.com/docs/liveswitch/server/advanced-topics#TURNintheMediaServer
            */

            // Monitor the connection state changes.
            connection.addOnStateChange((connection) => {
                fm.liveswitch.Log.info(connection.getId() + ': SFU upstream connection state is ' +
                    new fm.liveswitch.ConnectionStateWrapper(connection.getState()).toString() + '.');

                // Cleanup if the connection closes or fails.
                if (connection.getState() == fm.liveswitch.ConnectionState.Closing ||
                    connection.getState() == fm.liveswitch.ConnectionState.Failing) {
                    if (connection.getRemoteClosed()) {
                        fm.liveswitch.Log.info(connection.getId() + ': Media server closed the connection.');
                    }
                    this.logConnectionState(connection, "SFU Upstream");
                    if (this.dataChannelsSupported) {
                        this.dataChannels = this.dataChannels.filter(element => element !== dataChannel);
                    }
                }
                else if (connection.getState() == fm.liveswitch.ConnectionState.Failed) {
                    // Note: no need to close the connection as it's done for us.
                    this.openSfuUpstreamConnection(tag);
                    this.logConnectionState(connection, "SFU Upstream");
                }
                else if (connection.getState() == fm.liveswitch.ConnectionState.Connected) {
                    this.logConnectionState(connection, "SFU Upstream");
                }
            });

            // Open the connection.
            connection.open();

            return connection;
        }

        private openSfuDownstreamConnection(remoteConnectionInfo: fm.liveswitch.ConnectionInfo, tag?: string): fm.liveswitch.SfuDownstreamConnection {
            // Create remote media to manage incoming media.
            let remoteMedia = new fm.liveswitch.RemoteMedia();
            remoteMedia.setAudioMuted(false);
            remoteMedia.setVideoMuted(this.audioOnly);

            // Add the remote video view to the layout.
            if (remoteMedia.getView()) {
                remoteMedia.getView().id = 'remoteView_' + remoteMedia.getId();
                if (remoteConnectionInfo.getVideoStream()) {
                    this.createRemoteContextMenu(remoteMedia.getId(), remoteConnectionInfo.getVideoStream().getSendEncodings()).bindTo(remoteMedia.getView());
                }
            }
            this.layoutManager.addRemoteView(remoteMedia.getId(), remoteMedia.getView());

            let connection: fm.liveswitch.SfuDownstreamConnection;

            let dataChannel: fm.liveswitch.DataChannel;
            let dataStream: fm.liveswitch.DataStream;

            if (this.dataChannelsSupported && remoteConnectionInfo.getHasData() != null) {
                dataChannel = this.prepareDataChannel();
                dataStream = new fm.liveswitch.DataStream(dataChannel);
            }

            let audioStream: fm.liveswitch.AudioStream;
            let videoStream: fm.liveswitch.VideoStream;

            if (remoteConnectionInfo.getHasAudio()) {
                audioStream = new fm.liveswitch.AudioStream(remoteMedia);
            }

            if (remoteConnectionInfo.getHasVideo() && !this.audioOnly) {
                videoStream = new fm.liveswitch.VideoStream(remoteMedia);

                let encodings = remoteConnectionInfo.getVideoStream().getSendEncodings();
                if (encodings && encodings.length > 1) {

                    for (var encoding in encodings) {
                        fm.liveswitch.Log.debug("Remote encoding: " + encoding.toString());
                    }

                    videoStream.setRemoteEncoding(encodings[0]);
                }
            }

            connection = this.channel.createSfuDownstreamConnection(remoteConnectionInfo, audioStream, videoStream, dataStream);
            
            this.prepareConnection(connection);
            this.enableStereoOpusOnChrome(connection);

            this.sfuDownstreamConnections[remoteMedia.getId()] = connection;
            this.remoteMediaMaps[remoteMedia.getId()] = connection;

            // Tag the connection (optional).
            if (tag == null) {
                tag = 'sfu-downstream';
            }
            connection.setTag(tag);

            /*
            Embedded TURN servers are used by default.  For more information refer to:
            https://help.frozenmountain.com/docs/liveswitch/server/advanced-topics#TURNintheMediaServer
            */

            // Monitor the connection state changes.
            connection.addOnStateChange((connection) => {
                fm.liveswitch.Log.info(connection.getId() + ': SFU downstream connection state is ' +
                    new fm.liveswitch.ConnectionStateWrapper(connection.getState()).toString() + '.');

                // Cleanup if the connection closes or fails.
                if (connection.getState() == fm.liveswitch.ConnectionState.Closing ||
                    connection.getState() == fm.liveswitch.ConnectionState.Failing) {
                    if (connection.getRemoteClosed()) {
                        fm.liveswitch.Log.info(connection.getId() + ': Media server closed the connection.');
                    }
                    // Remove the remote view from the layout.
                    var lm = this.layoutManager;
                    if (lm != null) {
                        lm.removeRemoteView(remoteMedia.getId());
                    }

                    remoteMedia.destroy();
                    this.logConnectionState(connection, "SFU Downstream");
                    delete this.sfuDownstreamConnections[remoteMedia.getId()];
                    delete this.remoteMediaMaps[remoteMedia.getId()];
                }
                else if (connection.getState() == fm.liveswitch.ConnectionState.Failed) {
                    // Note: no need to close the connection as it's done for us.
                    this.openSfuDownstreamConnection(remoteConnectionInfo, tag);
                    this.logConnectionState(connection, "SFU Downstream");
                }
                else if (connection.getState() == fm.liveswitch.ConnectionState.Connected) {
                    this.logConnectionState(connection, "SFU Downstream");
                }
            });

            // Open the connection.
            connection.open();

            return connection;
        }

        public openPeerOfferConnection(remoteClientInfo: fm.liveswitch.ClientInfo, tag?: string): fm.liveswitch.PeerConnection {
            // Create remote media to manage incoming media.
            let remoteMedia = new fm.liveswitch.RemoteMedia();
            remoteMedia.setAudioMuted(false);
            remoteMedia.setVideoMuted(this.audioOnly);

            // Add the remote video view to the layout.
            if (remoteMedia.getView()) {
                remoteMedia.getView().id = 'remoteView_' + remoteMedia.getId();
                this.createRemoteContextMenu(remoteMedia.getId(), null).bindTo(remoteMedia.getView());
            }
            this.layoutManager.addRemoteView(remoteMedia.getId(), remoteMedia.getView());

            let connection: fm.liveswitch.PeerConnection;
            let audioStream = new fm.liveswitch.AudioStream(this.localMedia, remoteMedia);
            let videoStream:  fm.liveswitch.VideoStream;

            if (!this.audioOnly) {
                videoStream = new fm.liveswitch.VideoStream(this.localMedia, remoteMedia);
            }

           //Please note that DataStreams can also be added to Peer-to-peer connections.
           //Nevertheless, since peer connections do not connect to the media server, there may arise
           //incompatibilities with the peers that do not support DataStream (e.g. Microsoft Edge browser:
           //https://developer.microsoft.com/en-us/microsoft-edge/platform/status/rtcdatachannels/?filter=f3f0000bf&search=rtc&q=data%20channels).
           //For a solution around this issue and complete documentation visit:
           //https://help.frozenmountain.com/docs/liveswitch1/working-with-datachannels

            connection = this.channel.createPeerConnection(remoteClientInfo, audioStream, videoStream);
            
            this.prepareConnection(connection);
            this.enableStereoOpusOnChrome(connection);

            this.peerConnections[connection.getId()] = connection;
            this.remoteMediaMaps[remoteMedia.getId()] = connection;

            // Tag the connection (optional).
            if (tag == null) {
                tag = 'peer-offer';
            }
            connection.setTag(tag);

            /*
            Embedded TURN servers are used by default.  For more information refer to:
            https://help.frozenmountain.com/docs/liveswitch/server/advanced-topics#TURNintheMediaServer
            */

            // Monitor the connection state changes.
            connection.addOnStateChange((connection) => {
                fm.liveswitch.Log.info(connection.getId() + ': Peer connection state is ' +
                    new fm.liveswitch.ConnectionStateWrapper(connection.getState()).toString() + '.');

                // Cleanup if the connection closes or fails.
                if (connection.getState() == fm.liveswitch.ConnectionState.Closing ||
                    connection.getState() == fm.liveswitch.ConnectionState.Failing) {
                    if (connection.getRemoteRejected()) {
                        fm.liveswitch.Log.info(connection.getId() + ': Remote peer rejected the offer.');
                    } else if (connection.getRemoteClosed()) {
                        fm.liveswitch.Log.info(connection.getId() + ': Remote peer closed the connection.');
                    }
                    // Remove the remote view from the layout.
                    var lm = this.layoutManager;
                    if (lm != null) {
                        lm.removeRemoteView(remoteMedia.getId());
                    }

                    remoteMedia.destroy();
                    delete this.peerConnections[connection.getId()];
                    delete this.remoteMediaMaps[remoteMedia.getId()];
                    this.logConnectionState(connection, "Peer");
                }
                else if (connection.getState() == fm.liveswitch.ConnectionState.Failed) {
                    // Note: no need to close the connection as it's done for us.
                    this.openPeerOfferConnection(remoteClientInfo, tag);
                    this.logConnectionState(connection, "Peer");
                }
                else if (connection.getState() == fm.liveswitch.ConnectionState.Connected) {
                    this.logConnectionState(connection, "Peer");
                }
            });

            // Open the connection (sends an offer to the remote peer).
            connection.open();

            return connection;
        }

        private openPeerAnswerConnection(peerConnectionOffer: fm.liveswitch.PeerConnectionOffer, tag?: string): fm.liveswitch.PeerConnection {
            // Create remote media to manage incoming media.
            let remoteMedia = new fm.liveswitch.RemoteMedia();
            remoteMedia.setAudioMuted(false);
            remoteMedia.setVideoMuted(this.audioOnly);

            // Add the remote video view to the layout.
            if (remoteMedia.getView()) {
                remoteMedia.getView().id = 'remoteView_' + remoteMedia.getId();
                    this.createRemoteContextMenu(remoteMedia.getId(), null).bindTo(remoteMedia.getView());
            }
            this.layoutManager.addRemoteView(remoteMedia.getId(), remoteMedia.getView());

            let connection: fm.liveswitch.PeerConnection;
            let audioStream: fm.liveswitch.AudioStream;
            let videoStream: fm.liveswitch.VideoStream;
            if (peerConnectionOffer.getHasAudio()) {
                audioStream = new fm.liveswitch.AudioStream(this.localMedia, remoteMedia);
            }

            if (peerConnectionOffer.getHasVideo()) {
                videoStream = new fm.liveswitch.VideoStream(this.localMedia, remoteMedia);
                if (this.audioOnly) {
                    videoStream.setLocalDirection(fm.liveswitch.StreamDirection.Inactive);
                }
            }

           //Please note that DataStreams can also be added to Peer-to-peer connections.
           //Nevertheless, since peer connections do not connect to the media server, there may arise
           //incompatibilities with the peers that do not support DataStream (e.g. Microsoft Edge browser:
           //https://developer.microsoft.com/en-us/microsoft-edge/platform/status/rtcdatachannels/?filter=f3f0000bf&search=rtc&q=data%20channels).
           //For a solution around this issue and complete documentation visit:
           //https://help.frozenmountain.com/docs/liveswitch1/working-with-datachannels

            connection = this.channel.createPeerConnection(peerConnectionOffer, audioStream, videoStream);

            this.prepareConnection(connection);
            this.enableStereoOpusOnChrome(connection);

            this.peerConnections[connection.getId()] = connection;
            this.remoteMediaMaps[remoteMedia.getId()] = connection;

            // Tag the connection (optional).
            if (tag == null) {
                tag = 'peer-answer';
            }
            connection.setTag(tag);

            /*
            Embedded TURN servers are used by default.  For more information refer to:
            https://help.frozenmountain.com/docs/liveswitch/server/advanced-topics#TURNintheMediaServer
            */

            // Monitor the connection state changes.
            connection.addOnStateChange((connection) => {
                fm.liveswitch.Log.info(connection.getId() + ': Peer connection state is ' +
                    new fm.liveswitch.ConnectionStateWrapper(connection.getState()).toString() + '.');

                // Cleanup if the connection closes or fails.
                if (connection.getState() == fm.liveswitch.ConnectionState.Closing ||
                    connection.getState() == fm.liveswitch.ConnectionState.Failing) {

                    if (connection.getRemoteClosed()) {
                        fm.liveswitch.Log.info(connection.getId() + ': Remote peer closed the connection.');
                    }
                    // Remove the remote view from the layout.
                    var lm = this.layoutManager;
                    if (lm != null) {
                        lm.removeRemoteView(remoteMedia.getId());
                    }

                    remoteMedia.destroy();
                    this.logConnectionState(connection, "Peer");
                    delete this.peerConnections[connection.getId()];
                    delete this.remoteMediaMaps[remoteMedia.getId()];
                }
                else if (connection.getState() == fm.liveswitch.ConnectionState.Failed) {
                    // Note: no need to close the connection as it's done for us.
                    // Note: do not offer a new answer here. Let the offerer reoffer and then we answer normally.
                    this.logConnectionState(connection, "Peer");
                }
                else if (connection.getState() == fm.liveswitch.ConnectionState.Connected) {
                    this.logConnectionState(connection, "Peer");
                }
            });

            // Open the connection (sends an answer to the remote peer).
            connection.open();

            return connection;
        }

        private logConnectionState(connection: fm.liveswitch.ManagedConnection, connectionType: String) {
            var streams = "";
            var streamCount = 0;
            if (connection.getAudioStream() != null) {
                streamCount++;
                streams = "audio";
            }
            if (connection.getDataStream() != null) {
                if (streams.length > 0) {
                    streams += "/";
                }
                streamCount++;
                streams += "data";
            }
            if (connection.getVideoStream() != null) {
                if (streams.length > 0) {
                    streams += "/";
                }
                streamCount++;
                streams += "video";
            }
            if (streamCount > 1) {
                streams += " streams.";
            }
            else {
                streams += " stream";
            }

            if (connection.getState() == fm.liveswitch.ConnectionState.Connected) {
                this.incomingMessage("System", connectionType + " connection connected with " + streams);
            }
            else if (connection.getState() == fm.liveswitch.ConnectionState.Closing) {
                this.incomingMessage("System", connectionType + " connnection closing for " + streams);
            }
            else if (connection.getState() == fm.liveswitch.ConnectionState.Failing) {
                var eventString = connectionType + " connection failing for " + streams;
                if (connection.getError() != null) {
                    eventString += connection.getError().getDescription();
                }
                this.incomingMessage("System", eventString);
            }
            else if (connection.getState() == fm.liveswitch.ConnectionState.Closed) {
                this.incomingMessage("System", connectionType + " connection closed for " + streams);
            }
            else if (connection.getState() == fm.liveswitch.ConnectionState.Failed) {
                this.incomingMessage("System", connectionType + " connection failed for " + streams);
            }
        } 

        private prepareConnection(connection: fm.liveswitch.ManagedConnection): void {
            let audioStream = connection.getAudioStream();
            if (audioStream) {
                audioStream.setOpusDisabled(this.opusDisabled);
                audioStream.setG722Disabled(this.g722Disabled);
                audioStream.setPcmuDisabled(this.pcmuDisabled);
                audioStream.setPcmaDisabled(this.pcmaDisabled);
            }

            let videoStream = connection.getVideoStream();
            if (videoStream) {
                videoStream.setVp8Disabled(this.vp8Disabled);
                videoStream.setVp9Disabled(this.vp9Disabled);
                videoStream.setH264Disabled(this.h264Disabled);
                videoStream.setH265Disabled(this.h265Disabled);
            }
        }

        private prepareDataChannel(): fm.liveswitch.DataChannel {
            var dc = new fm.liveswitch.DataChannel("data");

            var intervalID: number;

            let onStateChange = (dataChannel: fm.liveswitch.DataChannel) => {
                if (dataChannel.getState() == fm.liveswitch.DataChannelState.Connected) {
                    intervalID = setInterval(function () { dataChannel.sendDataString("Hello World!") }, 1000);
                }
                if (dataChannel.getState() == fm.liveswitch.DataChannelState.Closing || dataChannel.getState() == fm.liveswitch.DataChannelState.Failed) {
                    if (intervalID != null) {
                        clearInterval(intervalID);
                    }
                }

            };
            let onReceive = (dataChannelReceiveArgs: fm.liveswitch.DataChannelReceiveArgs) => {
                if (!this.dataChannelConnected) {
                    if (dataChannelReceiveArgs.getDataString != null) {
                        this.incomingMessage("System", "Data channel connection established. Received test message from server: " + dataChannelReceiveArgs.getDataString());
                    }
                    this.dataChannelConnected = true;
                }
            }
            dc.addOnStateChange(onStateChange);
            dc.setOnReceive(onReceive);
            return dc;
        }

        public toggleAudioMute(sender: MenuItem) {
            var config;
            if (this.sfuUpstreamConnection != null) {
                config = this.sfuUpstreamConnection.getConfig();
                config.setLocalAudioMuted(!config.getLocalAudioMuted());
                this.sfuUpstreamConnection.update(config);
            }
            if (this.mcuConnection != null) {
                config = this.mcuConnection.getConfig();
                config.setLocalAudioMuted(!config.getLocalAudioMuted());
                this.mcuConnection.update(config);
            }
            for (var key in this.peerConnections) {
                let peerconnection = this.peerConnections[key];
                config = peerconnection.getConfig();
                config.setLocalAudioMuted(!config.getLocalAudioMuted());
                peerconnection.update(config);
            }
            sender.checked = config.getLocalAudioMuted();
        }

        public toggleVideoMute(sender: MenuItem) {
            var config;
            if (this.sfuUpstreamConnection != null) {
                config = this.sfuUpstreamConnection.getConfig();
                config.setLocalVideoMuted(!config.getLocalVideoMuted());
                this.sfuUpstreamConnection.update(config);
            }
            if (this.mcuConnection != null) {
                config = this.mcuConnection.getConfig();
                config.setLocalVideoMuted(!config.getLocalVideoMuted());
                this.mcuConnection.update(config);
            }
            for (var key in this.peerConnections) {
                let peerconnection = this.peerConnections[key];
                config = peerconnection.getConfig();
                config.setLocalVideoMuted(!config.getLocalVideoMuted());
                peerconnection.update(config);
            }
            sender.checked = config.getLocalVideoMuted();
        }

        public toggleLocalVideoDisable(sender: MenuItem) {
            var config;
            if (this.sfuUpstreamConnection != null) {
                config = this.sfuUpstreamConnection.getConfig();
                config.setLocalVideoDisabled(!config.getLocalVideoDisabled());
                this.sfuUpstreamConnection.update(config);
            }
            if (this.mcuConnection != null) {
                config = this.mcuConnection.getConfig();
                config.setLocalVideoDisabled(!config.getLocalVideoDisabled());
                this.mcuConnection.update(config);
            }
            for (var key in this.peerConnections) {
                let peerConnection = this.peerConnections[key];
                config = peerConnection.getConfig();
                config.setLocalVideoDisabled(!config.getLocalVideoDisabled());
                peerConnection.update(config);
            }
            sender.checked = config.getLocalVideoDisabled();
        }

        public toggleLocalAudioDisable(sender: MenuItem) {
            var config;
            if (this.sfuUpstreamConnection != null) {
                config = this.sfuUpstreamConnection.getConfig();
                config.setLocalAudioDisabled(!config.getLocalAudioDisabled());
                this.sfuUpstreamConnection.update(config);
            }
            if (this.mcuConnection != null) {
                config = this.mcuConnection.getConfig();
                config.setLocalAudioDisabled(!config.getLocalAudioDisabled());
                this.mcuConnection.update(config);
            }
            for (var key in this.peerConnections) {
                let peerconnection = this.peerConnections[key];
                config = peerconnection.getConfig();
                config.setLocalAudioDisabled(!config.getLocalAudioDisabled());
                peerconnection.update(config);
            }
            sender.checked = config.getLocalAudioDisabled();
        }

        public toggleRemoteAudioDisable(sender: MenuItem) {
            var downstream = this.remoteMediaMaps[sender.id];
            var config = downstream.getConfig();
            config.setRemoteAudioDisabled(!config.getRemoteAudioDisabled());
            downstream.update(config);
            sender.checked = config.getRemoteAudioDisabled();
        }

        public toggleRemoteVideoDisable(sender: MenuItem) {
            var downstream = this.remoteMediaMaps[sender.id];
            var config = downstream.getConfig();
            config.setRemoteVideoDisabled(!config.getRemoteVideoDisabled());
            downstream.update(config);
            sender.checked = config.getRemoteVideoDisabled();
        }

        public audioOnlyMute(): boolean {
            var config;
            if (this.sfuUpstreamConnection != null) {
                config = this.sfuUpstreamConnection.getConfig();
                config.setLocalAudioMuted(!config.getLocalAudioMuted());
                this.sfuUpstreamConnection.update(config);
            }
            if (this.mcuConnection != null) {
                config = this.mcuConnection.getConfig();
                config.setLocalAudioMuted(!config.getLocalAudioMuted());
                this.mcuConnection.update(config);
            }
            for (var key in this.peerConnections) {
                let peerconnection = this.peerConnections[key];
                config = peerconnection.getConfig();
                config.setLocalAudioMuted(!config.getLocalAudioMuted());
                peerconnection.update(config);
            }
            return config.getLocalAudioMuted();
        }

        public toggleVideoPreview(): boolean {
            var lm = this.layoutManager;
            if (lm != null)
            {
                var videoPreview = lm.getLocalView();
                if (!videoPreview) {
                    return false;
                }
                if (videoPreview.style.display == 'none') {
                    videoPreview.style.display = '';
                    return true;
                }
                videoPreview.style.display = 'none';
                return false;
            }
            else
            {
                return false;
            }
        }
        
        public changeAudioDevice(id: string, name: string): fm.liveswitch.Future<Object> {
            return this.localMedia.changeAudioSourceInput(new fm.liveswitch.SourceInput(id, name));
        }

        public changeVideoDevice(id: string, name: string): fm.liveswitch.Future<Object> {
            return this.localMedia.changeVideoSourceInput(new fm.liveswitch.SourceInput(id, name));
        }

        public toggleSendEncoding(sender: MenuItem) {
            var index = sender.index;
            let encoding = this.localMedia.getVideoEncodings()[index];
            encoding.setDeactivated(!encoding.getDeactivated());
            this.localMedia.setVideoEncodings(this.localMedia.getVideoEncodings()); // trigger update
            fm.liveswitch.Log.debug("Toggled local encoding: " + index + " to deactivated: " + encoding.getDeactivated());
            sender.checked = !encoding.getDeactivated();
        }

        public toggleRecvEncoding(sender: MenuItem) {
            let id = sender.id;
            let index = sender.index;
            let connection = this.sfuDownstreamConnections[id];
            let encodings = connection.getRemoteConnectionInfo().getVideoStream().getSendEncodings();
            if (encodings != null && encodings.length > 1 && index < encodings.length) {
                var config = connection.getConfig();
                config.setRemoteVideoEncoding(encodings[index]);
                connection.update(config).then((_) => {
                    fm.liveswitch.Log.debug("Updated video encoding to: " + encodings[index] + " for connection: " + connection.getId());
                }).fail((ex) => {
                    fm.liveswitch.Log.error("Could not change video stream encoding for connection: " + connection.getId(), ex);
                });
            }
            this.checkOnly(sender);
        }

        public checkOnly(sender: MenuItem) {
            for (let menuItem of sender.parent.menuItems) {
                menuItem.checked = false;
            }
            sender.checked = true;
        }

        public createLocalContextMenu(encodings: fm.liveswitch.VideoEncodingConfig[]): ContextMenu {
            this.localContextMenu = new ContextMenu();
            var id = this.localMedia.getId();
            // Set up the Context Menu
            let menuItem = new MenuItem("Local");
            menuItem.disabled = true;
            this.localContextMenu.addMenuItem(menuItem);
            
            this.localContextMenu.addMenuItem(new MenuItem('-'));
            //MuteAudio
            let item = new MenuItem('Mute Audio', this.toggleAudioMute.bind(this));
            item.id = id;
            item.checked = false;
            this.localContextMenu.addMenuItem(item);
            //MuteVideo
            item = new MenuItem('Mute Video', this.toggleVideoMute.bind(this));
            item.id = id;
            item.checked = false;
            this.localContextMenu.addMenuItem(item);

            this.localContextMenu.addMenuItem(new MenuItem('-'));
            //DisableAudio
            item = new MenuItem('Disable Audio', this.toggleLocalAudioDisable.bind(this));
            item.id = id;
            item.checked = false;
            this.localContextMenu.addMenuItem(item);
            //DisableVideo
            item = new MenuItem('Disable Video', this.toggleLocalVideoDisable.bind(this));
            item.id = id;
            item.checked = false;
            this.localContextMenu.addMenuItem(item);

            if (this.simulcast) {
                //Encodings
                if (encodings != null && encodings.length > 1) {
                    this.localContextMenu.addMenuItem(new MenuItem('-'));

                    this.localContextMenu.addMenuItem(new MenuItem('Video Encoding', encodings.map(encoding => {
                        let subMenuItem = new MenuItem(encoding.toString(), this.toggleSendEncoding.bind(this));
                        subMenuItem.checked = true;
                        subMenuItem.id = id;
                        return subMenuItem;
                    })));
                }
            }
            return this.localContextMenu;
        }

        public createRemoteContextMenu(id: string, encodings: fm.liveswitch.EncodingInfo[]): ContextMenu {
            let remoteContextMenu: ContextMenu = new ContextMenu();
            // Set up the Context Menu
            let menuItem = new MenuItem("Remote");
            menuItem.disabled = true;
            remoteContextMenu.addMenuItem(menuItem);

            remoteContextMenu.addMenuItem(new MenuItem('-'));
            //DisableAudio
            let item = new MenuItem('Disable Audio', this.toggleRemoteAudioDisable.bind(this));
            item.id = id;
            item.checked = false;
            remoteContextMenu.addMenuItem(item);
            //DisableVideo
            item = new MenuItem('Disable Video', this.toggleRemoteVideoDisable.bind(this));
            item.id = id;
            item.checked = false;
            remoteContextMenu.addMenuItem(item);

            if (this.simulcast) {
                //Encodings
                if (encodings != null && encodings.length > 1) {
                    remoteContextMenu.addMenuItem(new MenuItem('-'));

                    remoteContextMenu.addMenuItem(new MenuItem('Video Encoding', encodings.map(encoding => {
                        let subMenuItem = new MenuItem(encoding.toString(), this.toggleRecvEncoding.bind(this));
                        subMenuItem.checked = encoding == encodings[0];
                        subMenuItem.id = id;
                        return subMenuItem;
                    })));
                }
            }
            return remoteContextMenu;
        }

        private enableStereoOpusOnChrome(connection: fm.liveswitch.ManagedConnection): void {
            if (fm.liveswitch.Util.isChrome() && this.enableOpusStereo) {
                // This is a work around for a chrome bug.
                // This enables stereo audio on chrome.
                // https://bugs.chromium.org/p/webrtc/issues/detail?id=8133
                connection.addOnLocalDescription((conn, sessionDescription) => {
                    let sdpMessage = sessionDescription.getSdpMessage();
                    let audioDescription = sdpMessage.getAudioDescription();
                    let rtpMapAttribute = audioDescription.getRtpMapAttribute("opus", 48000, "2");
                    if (rtpMapAttribute) {
                        let formatParametersAttribute = rtpMapAttribute.getRelatedFormatParametersAttribute();
                        formatParametersAttribute.setFormatSpecificParameter("stereo", "1");
                    }
                });
            }
        }

    }
}
