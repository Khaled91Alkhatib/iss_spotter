const request = require("request");

const fetchMyIP = function(callback) {
  const url1 = "https://api.ipify.org?format=json";
  request(url1, (error, response, body) => {
    if (error) {
      return callback(error, null);
    } else if (response.statusCode !== 200) {
      const msg = `Status code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    } else {
      const ip = JSON.parse(body).ip;
      callback(null, ip);
    }
  });
};

const fetchCoordsByIP = function(ip, cb) {
  const url2 = `https://freegeoip.app/json/${ip}`;
  request(url2, (error, response, body) => {
    if (error) {
      return cb(error, null);
    } else if (response.statusCode !== 200) {
      cb(Error(`Status Code ${response.statusCode} when fetching Coordinates for IP: ${body}`), null);
      return;
    } else {
      const { latitude, longitude } = JSON.parse(body);
      cb(null, { latitude, longitude });
    }
  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  const url3 = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;
  request(url3, (error, response, body) => {
    if (error) {
      return callback(error, null);
    } else if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    } else {
      const result = JSON.parse(body).response;
      callback(null, result);
    }
  });
};


const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }
    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }
      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, nextPasses);
      });
    });
  });
};

module.exports = {nextISSTimesForMyLocation};