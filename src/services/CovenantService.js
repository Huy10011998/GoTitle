import {ENDPOINT} from 'react-native-dotenv';

export const CovenantService = {
    getAll:(title) => fetch(ENDPOINT + '/api/title/'+title.id +'/covenants',
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
        .then((json) => {
            return json;
        })
        .catch((error) =>{
            console.warn("Error" + error + ' ' + ENDPOINT);
            alert("Covenant Service:\n" + error + "\n" + ENDPOINT);
        }),
    create: (title,covenant) => fetch(ENDPOINT + '/api/title/'+title.id+'/covenants',
        {
            method: 'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                covenant: covenant
            })
        })
        .then((response) =>{
            return response.json;
        })
        .then((json) =>{
            return json;
        })
        .catch((error) =>{
            console.warn("Error" + error + ' ' + ENDPOINT);
            alert("Covenant Service:\n" + error + "\n" + ENDPOINT);
        }),
    update: (title,covenant) => fetch(ENDPOINT + '/api/title/'+title.id +'/covenant/' + covenant.id,
        {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content': 'application/json'
            },
            body: JSON.stringify({
                covenant: covenant
            })
        })
        .then((response) =>{
            return response.json;
        })
        .then((json) => {
            return json;
        })
        .catch((error) =>{
            console.warn("Error" + error + ' ' + ENDPOINT);
            alert("Covenant Service:\n" + error + "\n" + ENDPOINT);
        }),
    delete: (title,covenant) => fetch(ENDPOINT + 'api/title/'+title.id +'/covenant/' + covenant.id,
        {
            method:'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                covenant: covenant
            })
        })
        .then((reponse) =>{
            return reponse.json;
        })
        .then((json) =>{
            return json;
        })
        .catch((error) =>{
            console.warn("Error" + error + ' ' + ENDPOINT);
            alert("Covenant Service:\n" + error +"\n" + ENDPOINT);
        })
};