importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');


firebase.initializeApp({
    // EDITME:
    apiKey: 'AIzaSyC_6oC7imbci1aDyUgNMcien24D9R7DHsU',
    authDomain: 'http://frostyfoods-fc646.firebaseapp.com',
    projectId: 'frostyfoods-fc646',
    storageBucket: '252681830236',
    messagingSenderId: 'http://frostyfoods-fc646.firebasestorage.app',
    appId: '1:252681830236:web:4933a441df849a4ed28b99',
    measurementId: 'G-8VX0NDE8MC',
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
