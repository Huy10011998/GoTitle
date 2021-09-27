import {ENDPOINT} from 'react-native-dotenv';

export const PlatFloorPlansService = {
    getAll: (title) => fetch(ENDPOINT + '/api/title/'+title.id+'/plat-floor-plans',
        {
            method:'GET',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
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
            alert("Liens Service:\n" + error + "\n" + ENDPOINT);
        }),
    create: (title,platFloorPlans) => fetch(ENDPOINT + '/api/title/'+title.id+'/plat-floor-plans',
        {
            method:'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                platFloorPlans: platFloorPlans,
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
            alert("PlatFloorPlans Service:\n" + error + "\n" + ENDPOINT);
        }),
    update: (title,platFloorPlans) => fetch(ENDPOINT + '/api/title/'+title.id+'/plat-floor-plans/'+platFloorPlans.id,
        {
            method:'PUT',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                platFloorPlans: platFloorPlans,
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
            alert("PlatFloorPlans Service:\n" + error + "\n" + ENDPOINT);
        }),
    delete: (platFloorPlans) => fetch(ENDPOINT + '/api/title.plat-floor-plans/'+platFloorPlans.id,
        {
            method:'DELETE',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                platFloorPlans: platFloorPlans,
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
            alert("PlatFloorPlans Service:\n" + error + "\n" + ENDPOINT);})
};
