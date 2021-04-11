fm.liveswitch.Util.addOnLoad(function () {
    // Get DOM elements.
    var channelSelector = document.getElementById('channelSelector');
    var nameInput = document.getElementById('userNameInput');
    var startSessionInput = document.getElementById('channelInput');
    var startSessionButton = document.getElementById('joinButton');
    var screencaptureCheckbox = document.getElementById('screenShareInput');
    var receiveonlyCheckbox = document.getElementById('receiveOnlyInput');
    var audioonlyCheckbox = document.getElementById('audioOnlyInput');
    var simulcastCheckbox = document.getElementById('simulcastInput');
    var joinType = document.getElementById('connectionModeInput');
    var videoResolution = document.getElementById('video-resolution');
    var appId = document.getElementById('app-id');
    var videoChat = document.getElementById('video-chat');
    var loading = document.getElementById('loading');
    var video = document.getElementById('video');
    var leaveButton = document.getElementById('leaveButton');
    var sendButton = document.getElementById('sendButton');
    var sendInput = document.getElementById('sendInput');
    var text = document.getElementById('eventLog');
    var toggleAudioMute = document.getElementById('toggleAudioMute');
    var toggleVideoPreview = document.getElementById('toggleVideoPreview');
    var chromeExtensionInstallButton = document.getElementById('chromeExtensionInstallButton');
    var audioDeviceList = document.getElementById('audioDeviceList');
    var videoDeviceList = document.getElementById('videoDeviceList');
    var sendEncodingsGroup = document.getElementById('sendEncodingsGroup');
    videoChat.style.height = (window.innerHeight - 138 - 138).toString();
    channelSelector.style.height = (window.innerHeight - 138 - 138).toString();
    // Create new App.
    var app = new chat.App(document.getElementById('log'));
    window.App = app;
    // Create a random 6 digit number for the new channel ID.
    nameInput.value = 'Anonymous';
    startSessionInput.value = (Math.floor(Math.random() * 900000) + 100000).toString();
    screencaptureCheckbox.disabled = !fm.liveswitch.LocalMedia.canScreenShare();
    // No simulcast while screen-sharing.
    if (!screencaptureCheckbox.disabled) {
        fm.liveswitch.Util.observe(screencaptureCheckbox, 'click', function (evt) {
            simulcastCheckbox.disabled = screencaptureCheckbox.checked;
            if (simulcastCheckbox.disabled) {
                simulcastCheckbox.checked = false;
            }
        });
    }
    var start = function (channelId) {
        if (window.console && window.console.log) {
            window.console.log(channelId);
        }
        if (app.channelId) {
            return;
        }
        if (channelId.length < 1 || channelId.length > 255) {
            alert('Channel ID must be at least 1 and at most 255 characters long.');
            return;
        }
        var applicationId = getHashParameter('application');
        if (applicationId) {
            app.applicationId = applicationId;
        }
        app.channelId = channelId;
        app.mode = joinType.selectedIndex + 1;
        // Switch the UI context.
        setHashParameter('channel', app.channelId);
        setHashParameter('mode', app.mode.toString());
        var audioonly = audioonlyCheckbox.checked;
        if (audioonly) {
            setHashParameter('audioonly', '1');
        }
        var receiveonly = receiveonlyCheckbox.checked;
        if (receiveonly) {
            setHashParameter('receiveonly', '1');
        }
        var simulcast = simulcastCheckbox.checked;
        if (simulcast) {
            setHashParameter('simulcast', '1');
        }
        var screencapture = screencaptureCheckbox.checked;
        if (screencapture) {
            setHashParameter('screencapture', '1');
        }
        // hash-only parameters
        var width = parseInt(getHashParameter('width'));
        if (width) {
            app.videoWidth = width;
        }
        var height = parseInt(getHashParameter('height'));
        if (height) {
            app.videoHeight = height;
        }
        var opus = getHashParameter('opus');
        if (opus == '0' || opus == 'false' || opus == 'no') {
            app.opusDisabled = true;
        }
        var g722 = getHashParameter('g722');
        if (g722 == '0' || g722 == 'false' || g722 == 'no') {
            app.g722Disabled = true;
        }
        var pcmu = getHashParameter('pcmu');
        if (pcmu == '0' || pcmu == 'false' || pcmu == 'no') {
            app.pcmuDisabled = true;
        }
        var pcma = getHashParameter('pcma');
        if (pcma == '0' || pcma == 'false' || pcma == 'no') {
            app.pcmaDisabled = true;
        }
        var vp8 = getHashParameter('vp8');
        if (vp8 == '0' || vp8 == 'false' || vp8 == 'no') {
            app.vp8Disabled = true;
        }
        var vp9 = getHashParameter('vp9');
        if (vp9 == '0' || vp9 == 'false' || vp9 == 'no') {
            app.vp9Disabled = true;
        }
        var h264 = getHashParameter('h264');
        if (h264 == '0' || h264 == 'false' || h264 == 'no') {
            app.h264Disabled = true;
        }
        var h265 = getHashParameter('h265');
        if (h265 == '0' || h265 == 'false' || h265 == 'no') {
            app.h265Disabled = true;
        }
        videoChat.style.display = 'block';
        channelSelector.style.display = 'none';
        enableChatUI(false); // We disable the Chat UI now and enable it after registration.
        // Start the local media.
        if (!receiveonly) {
            fm.liveswitch.Log.info('Starting local media...');
        }
        app.startLocalMedia(video, screencapture, audioonly, receiveonly, simulcast, audioDeviceList, videoDeviceList).then(function (o) {
            if (!receiveonly) {
                fm.liveswitch.Log.info('Started local media.');
            }
            // Update the UI context.
            loading.style.display = 'none';
            video.style.display = 'block';
            // Enable/Disable Audio control button
            toggleAudioMute.removeAttribute('disabled');
            if (audioonly) {
                toggleAudioMute.style.display = "block";
            }
            else {
                toggleAudioMute.style.display = "none";
            }
            // Register.
            fm.liveswitch.Log.info('Registering...');
            app.setUserName(nameInput.value);
            app.joinAsync(incomingMessage, peerLeft, peerJoined, clientRegistered).then(function (o) {
                fm.liveswitch.Log.info('Registered.');
                writeMessage('<b>You\'ve joined session ' + app.channelId + ' as ' + nameInput.value + '.</b>');
                // Enable the leave button.
                leaveButton.removeAttribute('disabled');
            }, function (ex) {
                fm.liveswitch.Log.error('Could not joinAsync.', ex);
                stop();
            });
        }, function (ex) {
            fm.liveswitch.Log.error('Could not start local media.', ex);
            alert('Could not start local media.\n' + (ex.message || ex.name));
            stop();
        });
    };
    var sendMessage = function () {
        var msg = sendInput.value;
        sendInput.value = '';
        if (msg != '') {
            app.sendMessage(msg);
        }
    };
    var incomingMessage = function (name, message) {
        writeMessage('<b>' + name + ':</b> ' + message);
    };
    app.incomingMessage = incomingMessage;
    if (fm.liveswitch.Util.isEdge()) {
        app.dataChannelsSupported = false;
    }
    var enableChatUI = function (enable) {
        sendButton.disabled = !enable;
        sendInput.disabled = !enable;
    };
    // After the client has registered, we should enable the sendButton and sendInput.
    var clientRegistered = function () {
        enableChatUI(true);
    };
    // After the client has unregistered, we should disable the sendButton and sendInput. 
    var clientUnregistered = function () {
        enableChatUI(false);
    };
    var peerLeft = function (name) {
        writeMessage('<b>' + name + ' left.</b>');
    };
    var peerJoined = function (name) {
        writeMessage('<b>' + name + ' joined.</b>');
    };
    var writeMessage = function (msg) {
        var content = document.createElement('p');
        content.innerHTML = msg;
        text.appendChild(content);
        text.scrollTop = text.scrollHeight;
    };
    var switchToSessionSelectionScreen = function () {
        toggleAudioMute.setAttribute('disabled', 'disabled');
        // Update the UI context.
        video.style.display = 'none';
        loading.style.display = 'block';
        // Switch the UI context.
        channelSelector.style.display = 'block';
        videoChat.style.display = 'none';
        // Clear UI-driven hash parameters.
        unsetHashParameter('channel');
        unsetHashParameter('mode');
        unsetHashParameter('audioonly');
        unsetHashParameter('receiveonly');
        unsetHashParameter('simulcast');
        unsetHashParameter('screencapture');
    };
    var stop = function () {
        if (!app.channelId) {
            return;
        }
        app.channelId = '';
        // Disable the leave button.
        leaveButton.setAttribute('disabled', 'disabled');
        fm.liveswitch.Log.info('Unregistering...');
        app.leaveAsync(clientUnregistered).then(function (o) {
            fm.liveswitch.Log.info('Unregistered.');
            switchToSessionSelectionScreen();
        }, function (ex) {
            fm.liveswitch.Log.error('Could not unregister.', ex);
        });
        // Stop the local media.
        fm.liveswitch.Log.info('Stopping local media...');
        app.stopLocalMedia().then(function (o) {
            fm.liveswitch.Log.info('Stopped local media.');
        }, function (ex) {
            fm.liveswitch.Log.error('Could not stop local media.', ex);
        });
    };
    // Attach DOM events.
    fm.liveswitch.Util.observe(startSessionButton, 'click', function (evt) {
        evt.preventDefault();
        start(startSessionInput.value);
    });
    //add some restriction for simulcast
    fm.liveswitch.Util.observe(audioonlyCheckbox, 'click', function (evt) {
        if (audioonlyCheckbox.checked) {
            simulcastCheckbox.checked = false;
            simulcastCheckbox.disabled = true;
        }
        else {
            if (!receiveonlyCheckbox.checked) {
                simulcastCheckbox.disabled = false;
            }
        }
    });
    fm.liveswitch.Util.observe(receiveonlyCheckbox, 'click', function (evt) {
        if (receiveonlyCheckbox.checked) {
            simulcastCheckbox.checked = false;
            simulcastCheckbox.disabled = true;
        }
        else {
            if (!audioonlyCheckbox.checked) {
                simulcastCheckbox.disabled = false;
            }
        }
    });
    fm.liveswitch.Util.observe(simulcastCheckbox, 'click', function (evt) {
        if (simulcastCheckbox.checked) {
            audioonlyCheckbox.checked = false;
            audioonlyCheckbox.disabled = true;
            receiveonlyCheckbox.checked = false;
            receiveonlyCheckbox.disabled = true;
        }
        else {
            audioonlyCheckbox.disabled = false;
            receiveonlyCheckbox.disabled = false;
        }
    });
    fm.liveswitch.Util.observe(joinType, 'change', function (evt) {
        if (joinType.selectedIndex == 0 || joinType.selectedIndex == 1) {
            simulcastCheckbox.disabled = false;
            audioonlyCheckbox.disabled = false;
            receiveonlyCheckbox.disabled = false;
        }
        else {
            simulcastCheckbox.checked = false;
            simulcastCheckbox.disabled = true;
        }
    });
    fm.liveswitch.Util.observe(screencaptureCheckbox, 'click', function (evt) {
        if (this.checked) {
            if (fm.liveswitch.Plugin.getChromeExtensionRequired() && !fm.liveswitch.Plugin.getChromeExtensionInstalled()) {
                chromeExtensionInstallButton.setAttribute('class', 'btn btn-default');
                startSessionButton.setAttribute('disabled', 'disabled');
            }
        }
        else {
            if (fm.liveswitch.Plugin.getChromeExtensionRequired() && !fm.liveswitch.Plugin.getChromeExtensionInstalled()) {
                chromeExtensionInstallButton.setAttribute('class', 'btn btn-default hidden');
                startSessionButton.removeAttribute('disabled');
            }
        }
    });
    fm.liveswitch.Util.observe(startSessionInput, 'keydown', function (evt) {
        // Treat Enter as button click.
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode == 13) {
            start(startSessionInput.value);
            return false;
        }
    });
    fm.liveswitch.Util.observe(sendInput, 'keydown', function (evt) {
        // Treat Enter as button click.
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode == 13) {
            sendMessage();
            return false;
        }
    });
    fm.liveswitch.Util.observe(sendButton, 'click', function (evt) {
        sendMessage();
    });
    fm.liveswitch.Util.observe(leaveButton, 'click', function (evt) {
        stop();
    });
    fm.liveswitch.Util.observe(window, 'beforeunload', function (evt) {
        stop();
    });
    fm.liveswitch.Util.observe(toggleAudioMute, 'click', function (evt) {
        var muted = app.audioOnlyMute();
        toggleAudioMute.getElementsByTagName('i')[0].className = 'fa fa-lg ' + (muted ? 'fa-microphone-slash' : 'fa-microphone');
    });
    fm.liveswitch.Util.observe(toggleVideoPreview, 'click', function (evt) {
        var visible = app.toggleVideoPreview();
        toggleVideoPreview.getElementsByTagName('i')[0].className = 'fa fa-lg ' + (visible ? 'fa-eye' : 'fa-eye-slash');
    });
    fm.liveswitch.Util.observe(audioDeviceList, 'change', function (evt) {
        audioDeviceList.disabled = true;
        var option = audioDeviceList.options[audioDeviceList.selectedIndex];
        app.changeAudioDevice(option.value, option.text).then(function (o) {
            audioDeviceList.disabled = false;
        }, function (ex) {
            audioDeviceList.disabled = false;
            alert('Could not change audio device. ' + (ex.message || ex.name));
        });
    });
    fm.liveswitch.Util.observe(videoDeviceList, 'change', function (evt) {
        videoDeviceList.disabled = true;
        var option = videoDeviceList.options[videoDeviceList.selectedIndex];
        app.changeVideoDevice(option.value, option.text).then(function (o) {
            videoDeviceList.disabled = false;
        }, function (ex) {
            videoDeviceList.disabled = false;
            alert('Could not change video device. ' + (ex.message || ex.name));
        });
    });
    fm.liveswitch.Util.observe(chromeExtensionInstallButton, 'click', function () {
        if (fm.liveswitch.LocalMedia.getChromeExtensionRequiresUserGesture()) {
            // Try inline install.
            window.chrome.webstore.install(fm.liveswitch.LocalMedia.getChromeExtensionUrl(), function () {
                location.reload();
            }, function (error) {
                // Worst case scenario prompt to install manually.
                if (confirm('Inline installation failed. ' + error + '\n\nOpen Chrome Web Store?')) {
                    window.open(fm.liveswitch.LocalMedia.getChromeExtensionUrl(), '_blank');
                }
            });
        }
        else {
            // Manual installation required.
            window.open(fm.liveswitch.LocalMedia.getChromeExtensionUrl(), '_blank');
        }
    });
    // Register for handling fullscreen change event.
    fm.liveswitch.Util.observe(document, 'fullscreenchange', function (evt) { fullscreenChange(); });
    fm.liveswitch.Util.observe(document, 'webkitfullscreenchange', function (evt) { fullscreenChange(); });
    fm.liveswitch.Util.observe(document, 'mozfullscreenchange', function (evt) { fullscreenChange(); });
    fm.liveswitch.Util.observe(document, 'msfullscreenchange', function (evt) { fullscreenChange(); });
    // Register for mouse events over video element: show/hide fullscreen toggle.
    fm.liveswitch.Util.observe(video, 'mouseenter', function (evt) {
        video.classList.add('visible-controls');
    });
    fm.liveswitch.Util.observe(video, 'mouseleave', function (evt) {
        video.classList.remove('visible-controls');
    });
    // Hook click on video conference full screen toggle.
    fm.liveswitch.Util.observe(document.getElementById('fullscreen'), 'click', function (evt) {
        var fs = document.getElementById('fullscreen'), icon = document.getElementById('fullscreen-icon');
        if (icon.classList.contains('fa-expand')) {
            enterFullScreen();
        }
        else {
            exitFullScreen();
        }
    });
    // Put video element into fullscreen.
    var enterFullScreen = function () {
        var icon = document.getElementById('fullscreen-icon'), video = document.getElementById('video');
        if (video.requestFullscreen) {
            video.requestFullscreen();
        }
        else if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen();
        }
        else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        }
        else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
        else {
            // Add "fake" fullscreen via CSS.
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
            video.classList.add('fs-fallback');
        }
    };
    // Take doc out of fullscreen.
    var exitFullScreen = function () {
        var icon = document.getElementById('fullscreen-icon'), video = document.getElementById('video');
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        else {
            // Remove "fake" CSS fullscreen.
            icon.classList.add('fa-expand');
            icon.classList.remove('fa-compress');
            video.classList.remove('fs-fallback');
        }
    };
    // Handle event: doc has entered/exited fullscreen. 
    var fullscreenChange = function () {
        var icon = document.getElementById('fullscreen-icon'), fullscreenElement = document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;
        if (fullscreenElement) {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
        }
        else {
            icon.classList.add('fa-expand');
            icon.classList.remove('fa-compress');
        }
    };
    // config overrides
    var region = getHashParameter('region');
    if (region) {
        chat.Config.setRegion(region);
    }
    var gatewayUrl = getHashParameter('gatewayurl');
    if (gatewayUrl) {
        chat.Config.setGatewayUrl(gatewayUrl);
    }
    var sharedSecret = getHashParameter('sharedsecret');
    if (sharedSecret) {
        chat.Config.setSharedSecret(sharedSecret);
    }
    // UI default overrides
    var mode = parseInt(getHashParameter('mode'));
    if (mode && mode >= 1 && mode <= 3) {
        joinType.selectedIndex = (mode - 1);
    }
    var audioonly = getHashParameter('audioonly');
    if (audioonly) {
        audioonlyCheckbox.checked = (audioonly != '0' && audioonly != 'false' && audioonly != 'no');
    }
    var receiveonly = getHashParameter('receiveonly');
    if (receiveonly) {
        receiveonlyCheckbox.checked = (receiveonly != '0' && receiveonly != 'false' && receiveonly != 'no');
    }
    var simulcast = getHashParameter('simulcast');
    if (simulcast) {
        simulcastCheckbox.checked = (simulcast != '0' && simulcast != 'false' && simulcast != 'no');
    }
    var screencapture = getHashParameter('screencapture');
    if (screencapture && !screencaptureCheckbox.disabled) {
        screencaptureCheckbox.checked = (screencapture != '0' && screencapture != 'false' && screencapture != 'no');
    }
    // Automatically join if the channel ID is in the URL.
    var channelId = getHashParameter('channel');
    if (channelId) {
        startSessionInput.value = channelId;
    }
});
var getHashParameter = function (name) {
    name = encodeURI(name);
    var pairStrings = document.location.hash.substr(1).split('&');
    for (var i = 0; i < pairStrings.length; i++) {
        var pair = pairStrings[i].split('=');
        if (pair[0] == name) {
            if (pair.length > 1) {
                return pair[1];
            }
            return '';
        }
    }
    return null;
};
var setHashParameter = function (name, value) {
    name = encodeURI(name);
    value = encodeURI(value);
    var pairStrings = document.location.hash.substr(1).split('&');
    var updated = false;
    for (var i = 0; i < pairStrings.length; i++) {
        var pair = pairStrings[i].split('=');
        if (pair[0] == name) {
            if (pair.length > 1) {
                pair[1] = value;
            }
            else {
                pair.push(value);
            }
            pairStrings[i] = pair.join('=');
            updated = true;
            break;
        }
    }
    if (!updated) {
        pairStrings.push([name, value].join('='));
    }
    document.location.hash = pairStrings.join('&');
};
var unsetHashParameter = function (name) {
    name = encodeURI(name);
    var pairStrings = document.location.hash.substr(1).split('&');
    for (var i = 0; i < pairStrings.length; i++) {
        var pair = pairStrings[i].split('=');
        if (pair[0] == name) {
            pairStrings.splice(i, 1);
            break;
        }
    }
    document.location.hash = pairStrings.join('&');
};
var isNumeric = function (evt) {
    // Only accept digit- and control-keys.
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    return (charCode <= 31 || (charCode >= 48 && charCode <= 57));
};
