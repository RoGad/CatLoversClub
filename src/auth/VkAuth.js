export const initVKAuth = (appId, redirectUrl) => {
    if (typeof window === 'undefined') {
        console.error('VK Auth: window is undefined');
        return null;
    }

    if (!window.VKIDSDK) {
        console.error('VK SDK not loaded. Check if script is in index.html');
        return null;
    }

    if (!appId || appId === '') {
        console.error('VK App ID is not set');
        return null;
    }

    console.log('Initializing VK Auth with App ID:', appId);
    console.log('Redirect URL:', redirectUrl);

    try {
        const VKID = window.VKIDSDK;

        VKID.Config.init({
            app: parseInt(appId),
            redirectUrl: redirectUrl,
            responseMode: VKID.ConfigResponseMode.Callback,
            source: VKID.ConfigSource.LOWCODE,
            scope: '',
        });

        return {
            renderOneTap: (containerElement, onSuccess, onError) => {
                if (!containerElement) {
                    console.error('VK Auth: container element is required');
                    if (onError) {
                        onError(new Error('Container element is required'));
                    }
                    return;
                }

                try {
                    console.log('Rendering VK OneTap in container:', containerElement);
                    
                    const oneTap = new VKID.OneTap();

                    oneTap.render({
                        container: containerElement,
                        showAlternativeLogin: true
                    })
                    .on(VKID.WidgetEvents.ERROR, (error) => {
                        console.error('VK OneTap error:', error);
                        if (onError) {
                            onError(error);
                        }
                    })
                    .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, function (payload) {
                        console.log('VK OneTap login success, payload:', payload);
                        const code = payload.code;
                        const deviceId = payload.device_id;

                        VKID.Auth.exchangeCode(code, deviceId)
                            .then((data) => {
                                console.log('VK exchangeCode success:', data);

                                const accessToken = data.access_token || data.token;
                                const userId = data.user_id || data.user?.id || data.userId;
                                
                                if (!accessToken) {
                                    throw new Error('Access token not received from VK');
                                }

                                const vkData = {
                                    accessToken: accessToken,
                                    userId: userId,
                                    email: data.user?.email || data.email || null,
                                    firstName: data.user?.first_name || data.first_name || null,
                                    lastName: data.user?.last_name || data.last_name || null,
                                    photo: data.user?.photo_200 || data.photo_200 || null,
                                    expiresIn: data.expires_in || data.expiresIn,
                                    tokenType: data.token_type || data.tokenType || 'Bearer'
                                };

                                if (vkData.accessToken && vkData.userId) {
                                    getVKUserInfo(vkData.accessToken, vkData.userId)
                                        .then((userInfo) => {
                                            const finalData = {
                                                ...vkData,
                                                userId: userInfo.userId || vkData.userId,
                                                email: userInfo.email || vkData.email,
                                                firstName: userInfo.firstName || vkData.firstName,
                                                lastName: userInfo.lastName || vkData.lastName,
                                                photo: userInfo.photo || vkData.photo
                                            };
                                            console.log('Final VK user data:', finalData);
                                            if (onSuccess) {
                                                onSuccess(finalData);
                                            }
                                        })
                                        .catch((err) => {
                                            console.warn('Failed to get VK user info, using basic data:', err);
                                            // Используем базовые данные, если не удалось получить дополнительную информацию
                                            console.log('Using basic VK data:', vkData);
                                            if (onSuccess) {
                                                onSuccess(vkData);
                                            }
                                        });
                                } else {
                                    console.warn('Missing accessToken or userId, using basic data');
                                    if (onSuccess) {
                                        onSuccess(vkData);
                                    }
                                }
                            })
                            .catch((error) => {
                                console.error('VK exchangeCode error:', error);
                                if (onError) {
                                    onError(error);
                                }
                            });
                    });

                    console.log('VK OneTap rendered successfully');
                } catch (error) {
                    console.error('Error rendering VK OneTap:', error);
                    if (onError) {
                        onError(error);
                    }
                }
            }
        };
    } catch (error) {
        console.error('Error initializing VK Auth:', error);
        return null;
    }
};

export const getVKUserInfo = async (accessToken, userId) => {
    try {
        const response = await fetch(`https://api.vk.com/method/users.get?access_token=${accessToken}&user_ids=${userId}&fields=photo_200,email&v=5.131`);
        const data = await response.json();
        
        if (data.response && data.response[0]) {
            return {
                userId: data.response[0].id,
                firstName: data.response[0].first_name,
                lastName: data.response[0].last_name,
                photo: data.response[0].photo_200,
                email: data.response[0].email || null
            };
        }
        throw new Error('Failed to get VK user info');
    } catch (error) {
        console.error('Error getting VK user info:', error);
        throw error;
    }
};
