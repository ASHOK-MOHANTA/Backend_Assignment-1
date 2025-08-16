const { hostname } = require("os");
const url = require("url");

function parseUrl(inputUrl){
    const parseUrl = new URL (inputUrl);
    const queryParams ={};

    parseUrl.searchParams.forEach((key,value)=>{
        queryParams[key] = value;
    });

    return{
        hostname : parseUrl.hostname,
        pathname: parseUrl.pathname,
        query : queryParams,
    };
}

module.exports = parseUrl;