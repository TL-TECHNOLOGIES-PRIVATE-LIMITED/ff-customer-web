// A old file using fetch api data fetching
const access_key_param = 'x-access-key';
const access_key = "903361";
const token_prefix = "Bearer ";
const appUrl = process.env.REACT_APP_API_URL;
const appSubUrl = process.env.REACT_APP_API_SUBURL;
const api = {
    getAppUrl() {
        return appUrl.endsWith('/') ?
            appUrl.slice(0, -1) :
            appUrl;
    },
    register(Uid, name, email, mobile, type, fcm, country_code) {
        let myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        let formdata = new FormData();
        formdata.append("auth_uid", Uid);
        formdata.append("name", name);
        formdata.append("email", email)
        formdata.append("country_code", country_code)
        formdata.append("mobile", mobile)
        formdata.append("type", type)
        formdata.append("fcm_token", fcm);
        formdata.append("platform", "web");
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };
        return fetch(appUrl + appSubUrl + "/register", requestOptions);
    },
    login(Uid, fcm) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        var formdata = new FormData();
        formdata.append("auth_uid", Uid);
        formdata.append("fcm_token", fcm);
        formdata.append("platform", "web");
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/login", requestOptions);
    },
    logout(token) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var formdata = new FormData();

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/logout", requestOptions);
    },
    deleteAccount(token, uid) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var formdata = new FormData();
        formdata.append("auth_uid", uid);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/delete_account", requestOptions);
    },
    getSettings(isToken = 0, token) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        if (isToken === 1) {
            myHeaders.append("Authorization", token_prefix + token);
        }

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        var params = {
            is_web_setting: 1
        };
        var url = new URL(appUrl + appSubUrl + "/settings");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };

        return fetch(url, requestOptions);
    },
    getCity(latitude, longitude) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        var params = {
            latitude: latitude,
            longitude: longitude,
        };
        var url = new URL(appUrl + appSubUrl + "/city");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };

        return fetch(url, requestOptions);

    },
    getShop(latitiude, longitude, token = "") {

        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        var params = { latitude: latitiude, longitude: longitude };
        var url = new URL(appUrl + appSubUrl + "/shop");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };
        return fetch(url, requestOptions);
    },
    getBrands(limit, offset) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);

        // var formdata = new FormData();
        let params = {
            limit: limit,
            offset: offset
        };
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            // body: formdata,
            redirect: 'follow'
        };
        let url = new URL(appUrl + appSubUrl + "/brands");
        for (let p in params) {
            url.searchParams.append(p, params[p]);
        }
        return fetch(url, requestOptions);

    },
    // getCategory(id = 0) {
    //     var myHeaders = new Headers();
    //     myHeaders.append(access_key_param, access_key);

    //     var formdata = new FormData();
    //     formdata.append('category_id', id);

    //     var requestOptions = {
    //         method: 'GET',
    //         headers: myHeaders,
    //         // body: formdata,
    //         redirect: 'follow'
    //     };
    //     var params = { category_id: id };
    //     var url = new URL(appUrl + appSubUrl + "/categories");
    //     for (let k in params) {
    //         url.searchParams.append(k, params[k]);
    //     };
    //     return fetch(url, requestOptions);
    // },
    getCategory({
        id = "",
        limit = "",
        offset = "",
        slug = ""
    }) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);

        var formdata = new FormData();
        formdata.append('category_id', id);
        formdata.append('limit', limit);
        formdata.append('offset', offset);
        formdata.append('slug', slug);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            // body: formdata,
            redirect: 'follow'
        };
        var params = { category_id: id, limit: limit, offset: offset, slug: slug };
        var url = new URL(appUrl + appSubUrl + "/categories");
        for (let k in params) {
            if (params[k] !== "") { // Check if the parameter value is not empty
                url.searchParams.append(k, params[k]);
            }
        }

        return fetch(url, requestOptions);
    },
    getSlider() {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);

        //var formdata = new FormData();

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            //body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/sliders", requestOptions);
    },
    getOffer() {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/offers", requestOptions);
    },
    getSection(city_id, latitiude, longitude) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        var params = { city_id: city_id, latitude: latitiude, longitude: longitude };
        var url = new URL(appUrl + appSubUrl + "/sections");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };

        return fetch(url, requestOptions);
    },
    getUser(token) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        //var formdata = new FormData();

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            //body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/user_details", requestOptions);
    },
    edit_profile(uname, email, phonenumber, selectedFile = "", token) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var formdata = new FormData();

        formdata.append("name", uname);

        formdata.append("email", email);


        formdata.append("mobile", phonenumber);

        if (selectedFile !== null) {
            formdata.append("profile", selectedFile);
        }

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/edit_profile", requestOptions);
    },

    //Phase 1
    getProductbyFilter(latitude, longitude, filters, token, tag_names, slug) {
        var myHeaders = new Headers();
        //console.log("getProductbyFilter API ->", filters);
        myHeaders.append(access_key_param, access_key);
        token && myHeaders.append("Authorization", token_prefix + token);
        var formdata = new FormData();
        // formdata.append("city_id", city_id);
        formdata.append("latitude", latitude);
        formdata.append("longitude", longitude);
        if (tag_names !== undefined) {
            formdata.append("tag_names", tag_names)
        }
        if (slug !== undefined) {
            formdata.append("tag_slug", slug)
        }

        if (filters !== undefined) {
            for (const filter in filters) {
                if ((filters[filter] !== null && filters[filter] !== undefined && filters[filter] !== "") || filters[filter]?.length > 0) {
                    formdata.append(filter, filters[filter]);
                }
                if (filters[filter] === "sizes") {
                    formdata.append(filter, filters[filter]);
                }
            }
        }
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/products", requestOptions);
    },
    getProductbyId(latitude, longitude, id, token, slug) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        let formdata = new FormData();
        if (id !== -1) {
            formdata.append("id", id);
        }
        formdata.append("latitude", latitude);
        formdata.append("longitude", longitude);
        if (slug) {
            formdata.append("slug", slug);
        }
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/product_by_id", requestOptions);

    },
    getCart(token, latitude, longitude, checkout = 0) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        var params = { latitude: latitude, longitude: longitude, is_checkout: checkout };
        var url = new URL(appUrl + appSubUrl + "/cart");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };
        return fetch(url, requestOptions);

    },
    getCartSeller(token, latitude, longitude, checkout = 1) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        var params = { latitude: latitude, longitude: longitude, is_checkout: checkout };
        var url = new URL(appUrl + appSubUrl + "/cart");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };
        return fetch(url, requestOptions);

    },
    removeCart(token) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var formdata = new FormData();
        formdata.append("is_remove_all", 1);
        // formdata.append("is_remove_all", is_all_remove);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/cart/remove", requestOptions);
    },
    addToCart(token, product_id, product_variant_id, qty) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var formdata = new FormData();
        formdata.append("product_id", product_id);
        formdata.append("product_variant_id", product_variant_id);
        formdata.append("qty", qty);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/cart/add", requestOptions);
    },
    removeFromCart(token, product_id, product_variant_id) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var formdata = new FormData();
        formdata.append("product_id", product_id);
        formdata.append("product_variant_id", product_variant_id);
        formdata.append("is_remove_all", 0);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/cart/remove", requestOptions);
    },
    getFavorite(token, latitude, longitude) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        var params = { latitude: latitude, longitude: longitude };
        var url = new URL(appUrl + appSubUrl + "/favorites");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };
        return fetch(url, requestOptions);

    },
    addToFavotite(token, product_id) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var formdata = new FormData();
        formdata.append("product_id", product_id);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/favorites/add", requestOptions);
    },
    removeFromFavorite(token, product_id) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var formdata = new FormData();
        formdata.append("product_id", product_id);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/favorites/remove", requestOptions);
    },
    getAddress(token) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        return fetch(appUrl + appSubUrl + "/address", requestOptions);
    },
    addAddress(token, name, mobile, type, address, landmark, area, pincode, city, state, country, alternate_mobile, latitiude, longitude, is_default) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var formdata = new FormData();
        formdata.append("name", name);
        formdata.append("mobile", mobile);
        formdata.append("type", type);
        formdata.append("address", address);
        formdata.append("landmark", landmark);
        formdata.append("area", area);
        formdata.append("pincode", pincode);
        formdata.append("city", city);
        formdata.append("state", state);
        formdata.append("country", country);
        formdata.append("alternate_mobile", alternate_mobile ? alternate_mobile : "");
        formdata.append("latitude", latitiude);
        formdata.append("longitude", longitude);
        formdata.append("is_default", is_default ? 1 : 0);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/address/add", requestOptions);
    },
    deleteAddress(token, address_id) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var formdata = new FormData();
        formdata.append("id", address_id);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/address/delete", requestOptions);

    },
    updateAddress(token, address_id, name, mobile, type, address, landmark, area, pincode, city, state, country, alternate_mobile, latitiude, longitude, is_default) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var formdata = new FormData();
        formdata.append("id", address_id);
        formdata.append("name", name);
        formdata.append("mobile", mobile);
        formdata.append("type", type);
        formdata.append("address", address);
        formdata.append("landmark", landmark);
        formdata.append("area", area);
        formdata.append("pincode", pincode);
        formdata.append("city", city);
        formdata.append("state", state);
        formdata.append("country", country);
        formdata.append("alternate_mobile", alternate_mobile ? alternate_mobile : "");
        formdata.append("latitude", latitiude);
        formdata.append("longitude", longitude);
        formdata.append("is_default", is_default ? 1 : 0);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/address/update", requestOptions);
    },
    fetchTimeSlot() {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/settings/time_slots", requestOptions);
    },
    placeOrder(token, product_variant_id, quantity, total, delivery_charge, final_total, payment_method, address_id, deliveryTime, promocode_id = 0, wallet_balance, wallet_used, order_note) {
        // console.log(token, product_variant_id, quantity, total, delivery_charge, final_total, payment_method, address_id, deliveryTime, promocode_id, wallet_balance, wallet_used);
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var formdata = new FormData();
        formdata.append("product_variant_id", product_variant_id);
        formdata.append("quantity", quantity);
        formdata.append("total", total);
        formdata.append("delivery_charge", delivery_charge);
        formdata.append("final_total", final_total);
        formdata.append("payment_method", payment_method);
        formdata.append("address_id", address_id);
        if (deliveryTime === "NaN-NaN-NaN undefined") {
            formdata.append("delivery_time", "N/A");
        } else {
            formdata.append("delivery_time", deliveryTime);
        }

        if (order_note !== "") {
            formdata.append("order_note", order_note);
        }
        if (wallet_balance) {
            formdata.append("wallet_balance", wallet_balance);
        }
        if (wallet_used) {
            formdata.append("wallet_used", wallet_used);
        }
        promocode_id !== 0 && formdata.append("promocode_id", promocode_id);
        payment_method === "COD" || payment_method === "Wallet" ? formdata.append("status", 2) : formdata.append("status", 1);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        return fetch(appUrl + appSubUrl + "/place_order", requestOptions);
    },
    deleteOrder(token, order_id) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var formdata = new FormData();
        formdata.append("order_id", order_id);
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };
        return fetch(appUrl + appSubUrl + "/delete_order", requestOptions);
    },
    getOrders(token, limit = 10, offset = 0, type = 1, order_id) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        var params = !order_id ? { limit: limit, offset: offset, type: type } : { order_id };
        var url = new URL(appUrl + appSubUrl + "/orders");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };

        return fetch(url, requestOptions);
    },
    getPaymentSettings(token) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        return fetch(appUrl + appSubUrl + "/settings/payment_methods", requestOptions);
    },
    getTransactions(token, limit = 10, offset = 0, type = 'transactions') {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        var params = { limit: limit, offset: offset, type: type };
        var url = new URL(appUrl + appSubUrl + "/get_user_transactions");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };

        return fetch(url, requestOptions);

    },
    getInvoices(token, order_id) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var formData = new FormData();
        formData.append('order_id', order_id);

        var requestOptions = {
            method: 'POST',
            responseType: 'blob',
            headers: myHeaders,
            body: formData,
        };


        return fetch(appUrl + appSubUrl + "/invoice_download", requestOptions);
    },
    addTransaction(token, order_id, transaction_id, transaction_method, type, wallet_amount) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append('Authorization', token_prefix + token);
        var formData = new FormData();
        if (order_id) {
            formData.append('order_id', order_id);
        }
        formData.append('transaction_id', transaction_id);
        formData.append('payment_method', transaction_method);
        if (type) {
            formData.append("type", type);
        }
        if (wallet_amount) {
            formData.append("wallet_amount", wallet_amount);
        }
        formData.append('device_type', 'web');
        formData.append('app_version', '1.0');

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formData,
        };

        return fetch(appUrl + appSubUrl + "/add_transaction", requestOptions);

    },
    initiate_transaction(token, order_id, payment_method, type, wallet_amount) {

        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append('Authorization', token_prefix + token);
        var formData = new FormData();
        if (order_id) {
            formData.append('order_id', order_id);
        }
        if (type) {
            formData.append("type", type);
        }
        if (wallet_amount) {
            formData.append("wallet_amount", wallet_amount);
        }
        if (payment_method.toLocaleLowerCase() === 'razorpay') {
            formData.append("payment_method", "Razorpay");
        }
        else if (payment_method.toLocaleLowerCase() === 'stripe') {
            formData.append("payment_method", "Stripe");
        }
        else if (payment_method.toLocaleLowerCase() === 'paypal') {
            formData.append("payment_method", "Paypal");
            formData.append("request_from", "website");
        } else if (payment_method.toLocaleLowerCase() === "midtrans") {
            formData.append("payment_method", "Midtrans");
            formData.append("request_from", "website");
        } else if (payment_method.toLocaleLowerCase() === "phonepe") {
            formData.append("payment_method", "Phonepe");
            formData.append("request_from", "website");
        }
        else if (payment_method.toLocaleLowerCase() === "cashfree") {
            formData.append("payment_method", "Cashfree");
            formData.append("request_from", "website");
        }
        else if (payment_method.toLocaleLowerCase() === "paytabs") {
            formData.append("payment_method", "Paytabs");
            formData.append("request_from", "website");
        }

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formData,
        };

        return fetch(appUrl + appSubUrl + "/initiate_transaction", requestOptions);
    },
    addRazorpayTransaction(token, order_id, transaction_id, razorpay_order_id, razorpay_payment_id, razorpay_signature) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append('Authorization', token_prefix + token);
        var formData = new FormData();
        formData.append('order_id', order_id);
        formData.append('transaction_id', transaction_id);
        // formData.append("razorpay_order_id", razorpay_order_id);
        // formData.append("razorpay_payment_id", razorpay_payment_id);
        // formData.append("razorpay_signature", razorpay_signature);
        formData.append('type', 'order');
        formData.append('payment_method', 'Razorpay');
        formData.append('device_type', 'web');
        formData.append('app_version', '1.0');

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formData,
        };

        return fetch(appUrl + appSubUrl + "/add_transaction", requestOptions);
    },
    getNotification(token, limit = 5, offset = (1 * 5 - 5)) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        var params = { limit: limit, offset: offset };
        var url = new URL(appUrl + appSubUrl + "/notifications");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };

        return fetch(url, requestOptions);
    },
    getFaq(limit, offset) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        var params = { limit: limit, offset: offset };
        var url = new URL(appUrl + appSubUrl + "/faqs");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };

        return fetch(url, requestOptions);
    },
    getPromo(token, amount = 0) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        var params = { amount: amount };
        var url = new URL(appUrl + appSubUrl + "/promo_code");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        }

        return fetch(url, requestOptions);
    },
    setPromo(token, promo_code, amount = 0) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow'
        };

        var params = { promo_code: promo_code, total: amount };
        var url = new URL(appUrl + appSubUrl + "/promo_code/validate");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };
        return fetch(url, requestOptions);

    },
    getSystemLanguage(id, is_default) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        var params = {
            system_type: 3,
            id: id,
            is_default: is_default
        };
        var url = new URL(appUrl + appSubUrl + "/system_languages");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };

        return fetch(url, requestOptions);
    },
    updateOrderStatus(token, order_id, order_item_id, status, return_reason) {
        // 1:Payment Pending
        // 2:Received
        // 3:Processed
        // 4:Shipped
        // 5:Out For Delivery
        // 6:Delivered
        // 7:Cancelled
        // 8:Returned
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var data = new FormData();

        data.append('order_id', order_id);
        data.append('order_item_id', order_item_id);
        data.append('status', status);
        data.append('device_type', "website");
        data.append('app_version', "1.9.2 ");
        return_reason !== undefined && data.append("reason", return_reason);


        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow',
            body: data
        };

        return fetch(appUrl + appSubUrl + "/update_order_status", requestOptions);
    },
    getProductRatings(token, product_id, limit, offset) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        var params = {
            product_id: product_id,
            limit,
            offset
        };
        var url = new URL(appUrl + appSubUrl + "/products/ratings_list");
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        };

        return fetch(url, requestOptions);
    },
    addProductRating(token, product_id, rate, review, images) {
        // console.log(product_id, rate, review, images);
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var data = new FormData();
        data.append("product_id", product_id);
        data.append("rate", rate);
        data.append("review", review);

        for (let i = 0; i < images?.length; i++) {
            data.append(`image[${i}]`, images[i]);
        }
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow',
            body: data
        };

        return fetch(appUrl + appSubUrl + "/products/rating/add", requestOptions);
    }, getProductRatingById(token, ratingId) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var data = new FormData();
        data.append("id", ratingId);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow',
            body: data
        };

        return fetch(appUrl + appSubUrl + "/products/rating/edit", requestOptions);
    },
    updateProductRating(token, ratingId, rate, review, images, deleteImageIds) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var data = new FormData();
        data.append("id", ratingId);
        data.append("rate", rate);
        data.append("review", review);
        data.append("deleteImageIds", `[${deleteImageIds}]`);
        for (let i = 0; i < images.length; i++) {
            data.append(`image[${i}]`, images[i]);
        }
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow',
            body: data
        };

        return fetch(appUrl + appSubUrl + "/products/rating/update", requestOptions);
    },
    getShopBySellers(token, latitude, longitude, limit, offset) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        let params = {
            latitude: latitude,
            longitude: longitude,
            limit: limit,
            offset: offset
        };
        let url = new URL(appUrl + appSubUrl + "/sellers");
        for (let p in params) {
            url.searchParams.append(p, params[p]);
        }
        return fetch(url, requestOptions);
    },
    getShopByCountries(token, limit, offset) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        let params = {
            limit: limit,
            offset: offset
        };
        let url = new URL(appUrl + appSubUrl + "/countries");
        for (let p in params) {
            url.searchParams.append(p, params[p]);
        }
        return fetch(url, requestOptions);
    },
    getShopByBrands(token, limit, offset) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        let params = {
            limit: limit,
            offset: offset
        };
        let url = new URL(appUrl + appSubUrl + "/brands");
        for (let p in params) {
            url.searchParams.append(p, params[p]);
        }
        return fetch(url, requestOptions);
    },
    getProductRatingImages(token, product_id, limit, offset) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        var data = new FormData();
        data.append("product_id", product_id);
        data.append("limit", limit);
        data.append("offset", offset);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow',
            body: data
        };

        return fetch(appUrl + appSubUrl + "/products/rating/image_list", requestOptions);
    },
    getGuestCart(latitude, longitude, variantIds, quantities) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);

        let params = {
            latitude,
            longitude,
            variant_ids: variantIds,
            quantities
        };

        let url = new URL(appUrl + appSubUrl + "/cart/guest_cart");

        for (let p in params) {
            url.searchParams.append(p, params[p]);
        }

        let requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        return fetch(url, requestOptions);
    },
    bulkAddToCart(token, variantIds, quantities) {
        var myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);
        myHeaders.append("Authorization", token_prefix + token);

        let params = {
            variant_ids: variantIds,
            quantities
        };

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow',
        };

        let url = new URL(appUrl + appSubUrl + "/cart/bulk_add_to_cart_items");

        for (let p in params) {
            url.searchParams.append(p, params[p]);
        }
        return fetch(url, requestOptions);
    },
    checkUserExists(number) {
        let myHeaders = new Headers();
        myHeaders.append(access_key_param, access_key);

        let formData = new FormData();
        formData.append("mobile", number);

        let requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: formData,
            redirect: "follow"
        };

        return fetch(appUrl + appSubUrl + "/verify_user", requestOptions);

    }

};
export default api;