import {ENDPOINT, CLIENT_PASSPORT_SECRET, CLIENT_PASSPORT_ID,REFRESH_TIME_TOKEN} from "react-native-dotenv";

export const AuthService = {
    getToken: (username, password) => fetch(ENDPOINT + '/oauth/token',
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'password',
                username: username,
                password: password,
                client_secret: CLIENT_PASSPORT_SECRET,
                client_id: CLIENT_PASSPORT_ID
            })

        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({status:response.status,message:json.error_description}));
        })
        .then((json) => {
            return json;
        }),

    signUp: (firsName,lastName,companyName,email,password,confirmPassword,checked,signUp) => fetch(ENDPOINT + '/api/sign-up',
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: firsName,
                lastName: lastName,
                companyName: companyName,
                email: email,
                password: password,
                password_confirmation: confirmPassword,
                checked: checked,
                signUp:signUp
            })

        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({status:response.status,message:json.error_description, errors:json.errors}));
        })
        .then((json) => {
            return json;
        }),
    resetPassword:(email)=> fetch(ENDPOINT +'/api/password/email',
        {
            method:'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                email:email
            })

        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({status:response.status,message:json.error_description,errors:json.errors}));
        })
        .then((json) => {
            return json;
        }),
    refreshToken:(refresh_token)=>fetch(ENDPOINT + '/oauth/token',
        {
            method:'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'refresh_token',
                client_id: CLIENT_PASSPORT_ID,
                client_secret: CLIENT_PASSPORT_SECRET,
                refresh_token: refresh_token
            })
        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({status:response.status,message:json.error_description}));
        })
        .then((json) => {
            return json;
        }),
    getUser: (accessToken) => fetch(ENDPOINT + '/api/users',
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({status:response.status,message:json.error_description}));
        })
        .then((json) => {
            return json;
        }),
};