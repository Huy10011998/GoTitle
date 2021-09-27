import {ENDPOINT} from "react-native-dotenv";

export const TitleDetailService ={
    getAll: (title) => fetch(ENDPOINT + '/api/title/'+title.id+'/titleDetail',
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then((response) =>{
            return response.json;
        })
        .then((json) =>{
            return json;
        })
        .catch((error) =>{
            console.warn("Error", error + ' ' + ENDPOINT);
            alert("TitleDetail Service:\n" + error + "\n" + ENDPOINT);
        }),
    create: (title,titleDetail) => fetch(ENDPOINT + '/api/title/'+title.id+'/titleDetail',
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titleDetail: titleDetail,
            })
        })
        .then((response) =>{
            return response.json;
        })
        .then((json) => {
            return json;
        })
        .catch((error) =>{
            console.warn("Error", error + '' + ENDPOINT);
            alert("TitleDetail Service:\n" + error + "\n" + ENDPOINT);
        }),
    update: (title,titleDetail) => fetch(ENDPOINT + '/api/title/'+title.id+'/titleDetail' + titleDetail.id,
        {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titleDetail: titleDetail
            })
        })
        .then((response) =>{
            return response.json;
        })
        .then((json) =>{
            return json;
        })
        .catch((error) =>{
            console.warn("Error" , error + ' ' + ENDPOINT);
            alert("TitleDetail Service:\n" + error + "\n" + ENDPOINT);
        }),
    delete: (title,titleDetail) => fetch(ENDPOINT + '/api/title/'+title.id+'/titleDetail' + titleDetail.id,
        {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titleDetail: titleDetail
            })
        })
        .then((response) =>{
            return response.json;
        })
        .then((json) => {
            return json;
        })
        .catch((error) => {
            console.warn("Error" + error + ' ' + ENDPOINT);
            alert("TitleDetail Service:\n" + error + "\n" + ENDPOINT);
        })

};
