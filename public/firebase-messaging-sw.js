importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');


firebase.initializeApp({
    // EDITME:
    apiKey: 'AIzaSyAv4Eu9eMCRX2R3obN5dWI98Ovj1JMR47E',
    authDomain: 'http://frosty-foods-df69c.firebaseapp.com',
    projectId: 'frosty-foods-df69c',
    storageBucket: '683119608165',
    messagingSenderId: 'http://frosty-foods-df69c.firebasestorage.app',
    appId: '1:683119608165:web:bb95e2103c8aafc796618c',
    measurementId: 'G-WNBQLNJYEL',
});

const messaging = firebase.messaging();

try {
    messaging.setBackgroundMessageHandler(function (payload) {
        let data = payload?.notification;
        const notificationTitle = data?.title;
        const notificationOptions = {
            body: data?.body,
            icon: './logo.png' || 0,
            image: data?.image
        };

        return self.registration.showNotification(notificationTitle,
            notificationOptions);
    });

} catch (error) {
    console.log("This is an error ->", error);
}
