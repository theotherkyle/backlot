interface Window {
    chrome: any;
}

fm.liveswitch.Util.addOnLoad(() => {
    // Get DOM elements.
    let channelSelector = document.getElementById('channelSelector') as HTMLInputElement;
    let nameInput = document.getElementById('userNameInput') as HTMLInputElement;
    let startSessionInput = document.getElementById('channelInput') as HTMLInputElement;
    let startSessionButton = document.getElementById('joinButton') as HTMLButtonElement;
    let screencaptureCheckbox = document.getElementById('screenShareInput') as HTMLInputElement;
    let receiveonlyCheckbox = document.getElementById('receiveOnlyInput') as HTMLInputElement;
    let audioonlyCheckbox = document.getElementById('audioOnlyInput') as HTMLInputElement;
    let simulcastCheckbox = document.getElementById('simulcastInput') as HTMLInputElement;

    let joinType = document.getElementById('connectionModeInput') as HTMLSelectElement;
    let videoResolution = document.getElementById('video-resolution') as HTMLSelectElement;
    let appId = document.getElementById('app-id') as HTMLSelectElement;

    let videoChat = document.getElementById('video-chat');
    let loading = document.getElementById('loading');
    let video = document.getElementById('video');

    let leaveButton = document.getElementById('leaveButton') as HTMLButtonElement;
    let sendButton = document.getElementById('sendButton') as HTMLButtonElement;
    let sendInput = document.getElementById('sendInput') as HTMLInputElement;
    let text = document.getElementById('eventLog') as HTMLTextAreaElement;
    let toggleAudioMute = document.getElementById('toggleAudioMute') as HTMLElement;
    let toggleVideoPreview = document.getElementById('toggleVideoPreview') as HTMLButtonElement;
    let chromeExtensionInstallButton = document.getElementById('chromeExtensionInstallButton') as HTMLButtonElement;

    let audioDeviceList = document.getElementById('audioDeviceList') as HTMLSelectElement;
    let videoDeviceList = document.getElementById('videoDeviceList') as HTMLSelectElement;

    let sendEncodingsGroup = document.getElementById('sendEncodingsGroup') as HTMLDivElement;

    videoChat.style.height = (window.innerHeight - 138 - 138).toString();
    channelSelector.style.height = (window.innerHeight - 138 - 138).toString();

    // Create new App.
    let app = new chat.App(document.getElementById('log'));

    (window as any).App = app;

    // Create a random 6 digit number for the new channel ID.

    nameInput.value = 'Anonymous';
    startSessionInput.value = (Math.floor(Math.random() * 900000) + 100000).toString();

    screencaptureCheckbox.disabled = !fm.liveswitch.LocalMedia.canScreenShare();

    // No simulcast while screen-sharing.
    if (!screencaptureCheckbox.disabled) {
        fm.liveswitch.Util.observe(screencaptureCheckbox, 'click', function (evt: any) {
            simulcastCheckbox.disabled = screencaptureCheckbox.checked;
            if (simulcastCheckbox.disabled) {
                simulcastCheckbox.checked = false;
            }
        });
    }

    let start = (channelId: string) => {
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

        let applicationId = getHashParameter('application');
        if (applicationId) {
            app.applicationId = applicationId;
        }

        app.channelId = channelId;
        app.mode = joinType.selectedIndex + 1;

        // Switch the UI context.
        setHashParameter('channel', app.channelId);
        setHashParameter('mode', app.mode.toString());

        let audioonly = audioonlyCheckbox.checked;
        if (audioonly) {
            setHashParameter('audioonly', '1');
        }

        let receiveonly = receiveonlyCheckbox.checked;
        if (receiveonly) {
            setHashParameter('receiveonly', '1');
        }

        let simulcast = simulcastCheckbox.checked;
        if (simulcast) {
            setHashParameter('simulcast', '1');
        }

        let screencapture = screencaptureCheckbox.checked;
        if (screencapture) {
            setHashParameter('screencapture', '1');
        }

        // hash-only parameters
        let width = parseInt(getHashParameter('width'));
        if (width) {
            app.videoWidth = width;
        }

        let height = parseInt(getHashParameter('height'));
        if (height) {
            app.videoHeight = height;
        }

        let opus = getHashParameter('opus');
        if (opus == '0' || opus == 'false' || opus == 'no') {
            app.opusDisabled = true;
        }

        let g722 = getHashParameter('g722');
        if (g722 == '0' || g722 == 'false' || g722 == 'no') {
            app.g722Disabled = true;
        }

        let pcmu = getHashParameter('pcmu');
        if (pcmu == '0' || pcmu == 'false' || pcmu == 'no') {
            app.pcmuDisabled = true;
        }

        let pcma = getHashParameter('pcma');
        if (pcma == '0' || pcma == 'false' || pcma == 'no') {
            app.pcmaDisabled = true;
        }

        let vp8 = getHashParameter('vp8');
        if (vp8 == '0' || vp8 == 'false' || vp8 == 'no') {
            app.vp8Disabled = true;
        }

        let vp9 = getHashParameter('vp9');
        if (vp9 == '0' || vp9 == 'false' || vp9 == 'no') {
            app.vp9Disabled = true;
        }

        let h264 = getHashParameter('h264');
        if (h264 == '0' || h264 == 'false' || h264 == 'no') {
            app.h264Disabled = true;
        }

        let h265 = getHashParameter('h265');
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
        app.startLocalMedia(video, screencapture, audioonly, receiveonly, simulcast, audioDeviceList, videoDeviceList).then((o) => {
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
            } else {
                toggleAudioMute.style.display = "none";
            }

            // Register.
            fm.liveswitch.Log.info('Registering...');
            app.setUserName(nameInput.value);
            app.joinAsync(incomingMessage, peerLeft, peerJoined, clientRegistered).then((o) => {
                fm.liveswitch.Log.info('Registered.');
                writeMessage('<b>You\'ve joined session ' + app.channelId + ' as ' + nameInput.value + '.</b>');
                // Enable the leave button.
                leaveButton.removeAttribute('disabled');
            }, (ex) => {
                fm.liveswitch.Log.error('Could not joinAsync.', ex);
                stop();
            });
        }, (ex) => {
            fm.liveswitch.Log.error('Could not start local media.', ex);
            alert('Could not start local media.\n' + (ex.message || ex.name));
            stop();
        });
    };

    let sendMessage = () => {
        var msg = sendInput.value;
        sendInput.value = '';
        if (msg != '') {
            app.sendMessage(msg);
        }
    }

    let incomingMessage = (name: string, message: string) => {
        writeMessage('<b>' + name + ':</b> ' + message);
    };
    app.incomingMessage = incomingMessage;

    if (fm.liveswitch.Util.isEdge()) {
        app.dataChannelsSupported = false;
    }

    let enableChatUI = function (enable: boolean) {
        sendButton.disabled = !enable;
        sendInput.disabled = !enable;
    }

    // After the client has registered, we should enable the sendButton and sendInput.
    let clientRegistered = function () { 
        enableChatUI(true);
    }

    // After the client has unregistered, we should disable the sendButton and sendInput. 
    let clientUnregistered = function () { 
        enableChatUI(false);
    }

    var peerLeft = function (name: string) {
        writeMessage('<b>' + name + ' left.</b>')
    };

    var peerJoined = function (name: string) {
        writeMessage('<b>' + name + ' joined.</b>');
    };

    let writeMessage = (msg: string) => {
        var content = document.createElement('p');
        content.innerHTML = msg;
        text.appendChild(content);
        text.scrollTop = text.scrollHeight;
    };

    let switchToSessionSelectionScreen = () => {
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
    }

    let stop = () => {
        if (!app.channelId) {
            return;
        }

        app.channelId = '';

        // Disable the leave button.
        leaveButton.setAttribute('disabled', 'disabled');

        fm.liveswitch.Log.info('Unregistering...');
        app.leaveAsync(clientUnregistered).then((o) => {
            fm.liveswitch.Log.info('Unregistered.');
            switchToSessionSelectionScreen();
        }, (ex) => {
            fm.liveswitch.Log.error('Could not unregister.', ex);
        });

        // Stop the local media.
        fm.liveswitch.Log.info('Stopping local media...');
        app.stopLocalMedia().then((o) => {
            fm.liveswitch.Log.info('Stopped local media.');
        },
        (ex) => {
            fm.liveswitch.Log.error('Could not stop local media.', ex);
        });
    };

    // Attach DOM events.
    fm.liveswitch.Util.observe(startSessionButton, 'click', (evt: any) => {
        evt.preventDefault();
        start(startSessionInput.value);
    });

    //add some restriction for simulcast
    fm.liveswitch.Util.observe(audioonlyCheckbox, 'click', function (evt: any) {
        if (audioonlyCheckbox.checked) {
            simulcastCheckbox.checked = false;
            simulcastCheckbox.disabled = true;
        } else {
            if (!receiveonlyCheckbox.checked) {
                simulcastCheckbox.disabled = false;
            }
        }
    });
    fm.liveswitch.Util.observe(receiveonlyCheckbox, 'click', function (evt: any) {
        if (receiveonlyCheckbox.checked) {
            simulcastCheckbox.checked = false;
            simulcastCheckbox.disabled = true;
        } else {
            if (!audioonlyCheckbox.checked) {
                simulcastCheckbox.disabled = false;
            }
        }
    });
    fm.liveswitch.Util.observe(simulcastCheckbox, 'click', function (evt: any) {
        if (simulcastCheckbox.checked) {
            audioonlyCheckbox.checked = false;
            audioonlyCheckbox.disabled = true;
            receiveonlyCheckbox.checked = false;
            receiveonlyCheckbox.disabled = true;
        } else {
            audioonlyCheckbox.disabled = false;
            receiveonlyCheckbox.disabled = false;
        }
    });
    fm.liveswitch.Util.observe(joinType, 'change', function (evt: any) {
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

    fm.liveswitch.Util.observe(screencaptureCheckbox, 'click', function (evt: any) {
        if (this.checked) {
            if (fm.liveswitch.Plugin.getChromeExtensionRequired() && !fm.liveswitch.Plugin.getChromeExtensionInstalled()) {
                chromeExtensionInstallButton.setAttribute('class', 'btn btn-default');
                startSessionButton.setAttribute('disabled', 'disabled');
            }
        } else {
            if (fm.liveswitch.Plugin.getChromeExtensionRequired() && !fm.liveswitch.Plugin.getChromeExtensionInstalled()) {
                chromeExtensionInstallButton.setAttribute('class', 'btn btn-default hidden');
                startSessionButton.removeAttribute('disabled');
            }
        }
    });
    fm.liveswitch.Util.observe(startSessionInput, 'keydown', (evt: any) => {
        // Treat Enter as button click.
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode == 13) {
            start(startSessionInput.value);
            return false;
        }
    });
    fm.liveswitch.Util.observe(sendInput, 'keydown', (evt: any) => {
        // Treat Enter as button click.
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode == 13) {
            sendMessage();
            return false;
        }
    });
    fm.liveswitch.Util.observe(sendButton, 'click', (evt: any) => {
        sendMessage();
    });
    fm.liveswitch.Util.observe(leaveButton, 'click', (evt: any) => {
        stop();
    });
    fm.liveswitch.Util.observe(window, 'beforeunload', (evt: any) => {
        stop();
    });
    fm.liveswitch.Util.observe(toggleAudioMute, 'click', (evt: any) => {
        var muted = app.audioOnlyMute();
        toggleAudioMute.getElementsByTagName('i')[0].className = 'fa fa-lg ' + (muted ? 'fa-microphone-slash' : 'fa-microphone');
    });
    fm.liveswitch.Util.observe(toggleVideoPreview, 'click', (evt: any) => {
        var visible = app.toggleVideoPreview();
        toggleVideoPreview.getElementsByTagName('i')[0].className = 'fa fa-lg ' + (visible ?  'fa-eye' : 'fa-eye-slash');
    });
    fm.liveswitch.Util.observe(audioDeviceList, 'change', function (evt: any) {
        audioDeviceList.disabled = true;
        let option = audioDeviceList.options[audioDeviceList.selectedIndex];
        app.changeAudioDevice(option.value, option.text).then((o) => {
            audioDeviceList.disabled = false;
        }, (ex) => {
            audioDeviceList.disabled = false;
            alert('Could not change audio device. ' + (ex.message || ex.name));
        });
    });
    fm.liveswitch.Util.observe(videoDeviceList, 'change', function (evt: any) {
        videoDeviceList.disabled = true;
        let option = videoDeviceList.options[videoDeviceList.selectedIndex];
        app.changeVideoDevice(option.value, option.text).then((o) => {
            videoDeviceList.disabled = false;
        }, (ex) => {
            videoDeviceList.disabled = false;
            alert('Could not change video device. ' + (ex.message || ex.name));
        });
    });
    fm.liveswitch.Util.observe(chromeExtensionInstallButton, 'click', () => {
        if (fm.liveswitch.LocalMedia.getChromeExtensionRequiresUserGesture()) {
            // Try inline install.
            (window.chrome as any).webstore.install(fm.liveswitch.LocalMedia.getChromeExtensionUrl(), () => {
                location.reload();
            }, (error: Error) => {
                // Worst case scenario prompt to install manually.
                if (confirm('Inline installation failed. ' + error + '\n\nOpen Chrome Web Store?')) {
                    window.open(fm.liveswitch.LocalMedia.getChromeExtensionUrl(), '_blank');
                }
            });
        } else {
            // Manual installation required.
            window.open(fm.liveswitch.LocalMedia.getChromeExtensionUrl(), '_blank');
        }
    });

    // Register for handling fullscreen change event.
    fm.liveswitch.Util.observe(document, 'fullscreenchange', function (evt: any) { fullscreenChange(); });
    fm.liveswitch.Util.observe(document, 'webkitfullscreenchange', function (evt: any) { fullscreenChange(); });
    fm.liveswitch.Util.observe(document, 'mozfullscreenchange', function (evt: any) { fullscreenChange(); });
    fm.liveswitch.Util.observe(document, 'msfullscreenchange', function (evt: any) { fullscreenChange(); });

    // Register for mouse events over video element: show/hide fullscreen toggle.
    fm.liveswitch.Util.observe(video, 'mouseenter', function (evt: any) {

        video.classList.add('visible-controls');
    });
    fm.liveswitch.Util.observe(video, 'mouseleave', function (evt: any) {

        video.classList.remove('visible-controls');
    });

    // Hook click on video conference full screen toggle.
    fm.liveswitch.Util.observe(document.getElementById('fullscreen'), 'click', function (evt: any) {

        var fs = document.getElementById('fullscreen'),
            icon = document.getElementById('fullscreen-icon');

        if (icon.classList.contains('fa-expand')) {
            enterFullScreen();
        }
        else {
            exitFullScreen();
        }
    });

    // Put video element into fullscreen.
    var enterFullScreen = function () {

        var icon = document.getElementById('fullscreen-icon'),
            video = document.getElementById('video');

        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen();
        } else if ((video as any).webkitRequestFullscreen) {
            (video as any).webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
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

        var icon = document.getElementById('fullscreen-icon'),
            video = document.getElementById('video');

        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
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

        var icon = document.getElementById('fullscreen-icon'),
            fullscreenElement = (document as any).fullscreenElement ||
                document.mozFullScreenElement ||
                (document as any).webkitFullscreenElement ||
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
    let region = getHashParameter('region');
    if (region) {
        chat.Config.setRegion(region);
    }

    let gatewayUrl = getHashParameter('gatewayurl');
    if (gatewayUrl) {
        chat.Config.setGatewayUrl(gatewayUrl);
    }

    let sharedSecret = getHashParameter('sharedsecret');
    if (sharedSecret) {
        chat.Config.setSharedSecret(sharedSecret);
    }

    // UI default overrides
    let mode = parseInt(getHashParameter('mode'));
    if (mode && mode >= 1 && mode <= 3) {
        joinType.selectedIndex = (mode - 1);
    }

    let audioonly = getHashParameter('audioonly');
    if (audioonly) {
        audioonlyCheckbox.checked = (audioonly != '0' && audioonly != 'false' && audioonly != 'no');
    }

    let receiveonly = getHashParameter('receiveonly');
    if (receiveonly) {
        receiveonlyCheckbox.checked = (receiveonly != '0' && receiveonly != 'false' && receiveonly != 'no');
    }

    let simulcast = getHashParameter('simulcast');
    if (simulcast) {
        simulcastCheckbox.checked = (simulcast != '0' && simulcast != 'false' && simulcast != 'no');
    }

    let screencapture = getHashParameter('screencapture');
    if (screencapture && !screencaptureCheckbox.disabled) {
        screencaptureCheckbox.checked = (screencapture != '0' && screencapture != 'false' && screencapture != 'no');
    }

    // Automatically join if the channel ID is in the URL.
    let channelId = getHashParameter('channel');
    if (channelId) {
        startSessionInput.value = channelId;
    }
});

var getHashParameter = (name: string): string => {
    name = encodeURI(name);
    let pairStrings = document.location.hash.substr(1).split('&');
    for (let i = 0; i < pairStrings.length; i++) {
        let pair = pairStrings[i].split('=');
        if (pair[0] == name) {
            if (pair.length > 1) {
                return pair[1];
            }
            return '';
        }
    }
    return null;
};

var setHashParameter = (name: string, value: string): void => {
    name = encodeURI(name);
    value = encodeURI(value);
    let pairStrings = document.location.hash.substr(1).split('&');
    let updated = false;
    for (let i = 0; i < pairStrings.length; i++) {
        let pair = pairStrings[i].split('=');
        if (pair[0] == name) {
            if (pair.length > 1) {
                pair[1] = value;
            } else {
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

var unsetHashParameter = (name: string): void => {
    name = encodeURI(name);
    let pairStrings = document.location.hash.substr(1).split('&');
    for (let i = 0; i < pairStrings.length; i++) {
        let pair = pairStrings[i].split('=');
        if (pair[0] == name) {
            pairStrings.splice(i, 1);
            break;
        }
    }
    document.location.hash = pairStrings.join('&');
};

var isNumeric = (evt: any) => {
    // Only accept digit- and control-keys.
    let charCode = (evt.which) ? evt.which : evt.keyCode;
    return (charCode <= 31 || (charCode >= 48 && charCode <= 57));
};

// So TS does not complain we extend document and element typings
interface Document {
    msExitFullscreen: any;
    mozCancelFullScreen: any;
    mozFullScreenElement: any;
    msFullscreenElement: any;
}

interface HTMLElement {
    msRequestFullscreen(): void;
    mozRequestFullScreen(): void;
}