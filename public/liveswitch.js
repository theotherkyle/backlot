fm.liveswitch.Util.addOnLoad(() => {
    var videoContainer = document.getElementById("video");
    var videoLayout = null;
    var openNewLink = document.getElementById("open-new-link");
    openNewLink.setAttribute("href", openNewLink.getAttribute("href") + window.location.search);

    var gatewayUrl = new URL(window.location.href).searchParams.get("gwUrl");
    if (gatewayUrl == null || typeof gatewayUrl == 'undefined') {
        gatewayUrl = "http://localhost:8080/sync";
    }
    var appId = new URL(window.location.href).searchParams.get("appId");
    var token = new URL(window.location.href).searchParams.get("token");
    if (
        typeof token === "undefined" ||
        token === null ||
        typeof appId === "undefined" ||
        appId === null
    ) {
        alert(
            "Sorry, but you need a valid token and application ID to use this Pen! Reload the page with a token and application ID."
        );
        return;
    }
    var userId = fm.liveswitch.Guid.newGuid()
        .toString()
        .replace(/-/g, "");
    var deviceId = fm.liveswitch.Guid.newGuid()
        .toString()
        .replace(/-/g, "");
    var iceServers = [
        new fm.liveswitch.IceServer("stun:turn.frozenmountain.com:3478"),
        new fm.liveswitch.IceServer(
            "turn:turn.frozenmountain.com:80",
            "test",
            "pa55w0rd!"
        ),
        new fm.liveswitch.IceServer(
            "turns:turn.frozenmountain.com:443",
            "test",
            "pa55w0rd!"
        )
    ];

    fm.liveswitch.Log.registerProvider(
        new fm.liveswitch.ConsoleLogProvider(fm.liveswitch.LogLevel.Debug)
    );

    var layoutManager;
    var localMedia;

    var client;
    var channel;

    var startLocalMedia = function () {
        var promise = new fm.liveswitch.Promise();
        layoutManager = new fm.liveswitch.DomLayoutManager(videoContainer);
        localMedia = new fm.liveswitch.LocalMedia(
            true,
            new fm.liveswitch.VideoConfig(640, 480, 30),
            false
        );
        localMedia.start().then(
            o => {
                var localView = localMedia.getView();
                if (localView != null) {
                    localView.id = "localView";
                    layoutManager.setLocalView(localView);
                }
                promise.resolve(null);
            },
            ex => {
                fm.liveswitch.log.debug("error", ex);
            }
        );
        return promise;
    };

    var join = function (incomingMessage, peerLeft, peerJoined, clientRegistered) {
        var promise = new fm.liveswitch.Promise();
        client = new fm.liveswitch.Client(gatewayUrl, appId);
        client.addOnStateChange(function (client) {
            if (client.getState() == fm.liveswitch.ClientState.Registering) {
                fm.liveswitch.Log.debug("client is registering");
            } else if (client.getState() == fm.liveswitch.ClientState.Registered) {
                fm.liveswitch.Log.debug("client is registered");
            } else if (client.getState() == fm.liveswitch.ClientState.Unregistering) {
                fm.liveswitch.Log.debug("client is unregistering");
            } else if (client.getState() == fm.liveswitch.ClientState.Unregistered) {
                fm.liveswitch.Log.debug("client is unregistered");
            }
        });
        client.register(token).then(
            function (channels) {
                onClientRegistered(
                    channels,
                    incomingMessage,
                    peerLeft,
                    peerJoined,
                    clientRegistered
                );
                promise.resolve(null);
            },
            function (ex) {
                fm.liveswitch.Log.error(ex);
                promise.reject(ex);
            }
        );
        return promise;
    };

    var onClientRegistered = function (
        channels,
        incomingMessage,
        peerLeft,
        peerJoined,
        clientRegistered
    ) {
        channel = channels[0];
        channel.addOnRemoteClientJoin(function (remoteClientInfo) {
            fm.liveswitch.Log.info(
                "Remote client joined the channel (client ID: " +
                remoteClientInfo.getId() +
                ", device ID: " +
                remoteClientInfo.getDeviceId() +
                ", user ID: " +
                remoteClientInfo.getUserId() +
                ", tag: " +
                remoteClientInfo.getTag() +
                ")."
            );
            var n =
                remoteClientInfo.getUserAlias() != null
                    ? remoteClientInfo.getUserAlias()
                    : remoteClientInfo.getUserId();
            peerJoined(n);
        });
        channel.addOnRemoteClientLeave(function (remoteClientInfo) {
            var n =
                remoteClientInfo.getUserAlias() != null
                    ? remoteClientInfo.getUserAlias()
                    : remoteClientInfo.getUserId();
            peerLeft(n);
            fm.liveswitch.Log.info(
                "Remote client left the channel (client ID: " +
                remoteClientInfo.getId() +
                ", device ID: " +
                remoteClientInfo.getDeviceId() +
                ", user ID: " +
                remoteClientInfo.getUserId() +
                ", tag: " +
                remoteClientInfo.getTag() +
                ")."
            );
        });
        channel.addOnRemoteUpstreamConnectionOpen(function (remoteConnectionInfo) {
            fm.liveswitch.Log.info(
                "Remote client opened upstream connection (connection ID: " +
                remoteConnectionInfo.getId() +
                ", client ID: " +
                remoteConnectionInfo.getClientId() +
                ", device ID: " +
                remoteConnectionInfo.getDeviceId() +
                ", user ID: " +
                remoteConnectionInfo.getUserId() +
                ", tag: " +
                remoteConnectionInfo.getTag() +
                ")."
            );
        });
        channel.addOnRemoteUpstreamConnectionClose(function (remoteConnectionInfo) {
            fm.liveswitch.Log.info(
                "Remote client closed upstream connection (connection ID: " +
                remoteConnectionInfo.getId() +
                ", client ID: " +
                remoteConnectionInfo.getClientId() +
                ", device ID: " +
                remoteConnectionInfo.getDeviceId() +
                ", user ID: " +
                remoteConnectionInfo.getUserId() +
                ", tag: " +
                remoteConnectionInfo.getTag() +
                ")."
            );
        });
        channel.addOnMessage(function (client, message) {
            if (incomingMessage == null) return;
            var n =
                client.getUserAlias() != null
                    ? client.getUserAlias()
                    : client.getUserId();
            incomingMessage(n, message);
        });
        channel.addOnMcuVideoLayout(function (layout) {
            videoLayout = layout;
            var lm = layoutManager;
            if (lm != null) {
                lm.layout();
            }
        });
        console.log("open mcu connection");
        openMcuConnection();
        clientRegistered();
    };

    var openMcuConnection = function () {
        var remoteMedia = new fm.liveswitch.RemoteMedia();
        remoteMedia.setAudioMuted(false);
        if (remoteMedia.getView()) {
            remoteMedia.getView().id = "remoteView_" + remoteMedia.getId();
        }
        layoutManager.addRemoteView(remoteMedia.getId(), remoteMedia.getView());
        var connection;
        var audioStream;
        var videoStream;
        audioStream = new fm.liveswitch.AudioStream(localMedia, remoteMedia);
        videoStream = new fm.liveswitch.VideoStream(localMedia, remoteMedia);
        connection = channel.createMcuConnection(
            audioStream,
            videoStream
        );
        if (audioStream) {
            audioStream.setOpusDisabled(false);
            audioStream.setPcmuDisabled(false);
            audioStream.setPcmaDisabled(false);
        }
        if (videoStream) {
            videoStream.setVp8Disabled(false);
            videoStream.setVp9Disabled(false);
            videoStream.setH264Disabled(false);
        }
        var tag = "mcu";
        connection.setTag(tag);
        connection.setIceServers(iceServers);
        connection.addOnStateChange(function (connection) {
            fm.liveswitch.Log.info(
                connection.getId() +
                ": MCU connection state is " +
                new fm.liveswitch.ConnectionStateWrapper(
                    connection.getState()
                ).toString() +
                "."
            );
            if (
                connection.getState() == fm.liveswitch.ConnectionState.Closing ||
                connection.getState() == fm.liveswitch.ConnectionState.Failing
            ) {
                if (connection.getRemoteClosed()) {
                    fm.liveswitch.Log.info(
                        connection.getId() + ": Media server closed the connection."
                    );
                }
                if (layoutManager != null) {
                    layoutManager.removeRemoteView(remoteMedia.getId());
                }
                remoteMedia.destroy();
            } else if (
                connection.getState() == fm.liveswitch.ConnectionState.Failed
            ) {
                openMcuConnection(tag);
            }
        });
        layoutManager.addOnLayout(function (layout) {
            fm.liveswitch.LayoutUtility.floatLocalPreview(layout, videoLayout, connection.getId(), remoteMedia.getId());
        });
        connection.open();
        return connection;
    };

    var incomingMessage = function (name, message) {
        fm.liveswitch.Log.info(name + ": " + message);
    };
    var peerLeft = function (name) {
        fm.liveswitch.Log.info(name + " left");
    };
    var peerJoined = function (name) {
        fm.liveswitch.Log.info(name + " joined");
    };
    var clientRegistered = function () {
        fm.liveswitch.Log.info("registered");
    };
    fm.liveswitch.Util.observe(window, "beforeundload", evt => {
        leave();
    });

    var leave = function () {
        var promise = new fm.liveswitch.Promise();
        if (client != null) {
            fm.liveswitch.Log.info("Unregistering...");
            client
                .unregister()
                .then(function () {
                    fm.liveswitch.Log.info("Unregistered");
                })
                .fail(function () {
                    fm.liveswitch.Log.debug("Failed to unregister client.");
                });
        }
        leaveButton.setAttribute("disabled", "disabled");
        try {
            if (localMedia == null) {
                promise.resolve(null);
                return promise;
            }
            localMedia.stop().then(
                o => {
                    if (layoutManager != null) {
                        layoutManager.removeRemoteViews();
                        layoutManager.unsetLocalView();
                        layoutManager = null;
                    }
                    if (localMedia != null) {
                        localMedia = null;
                    }
                    promise.resolve(null);
                },
                ex => {
                    promise.reject(ex);
                }
            );
        } catch (ex) {
            promise.reject(ex);
        }
        return promise;
    };

    startLocalMedia().then(o => {
        join(incomingMessage, peerLeft, peerJoined, clientRegistered);
      video.style.height = '400px';
    });
});
