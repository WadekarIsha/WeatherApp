const app = angular.module('myApp', []);

app.controller('myController', ($scope, $http, $q) => {
    $scope.loadingspinner = true;

    function getSuccess(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log(lat,lng);
        const geocodingAPIKey = 'AIzaSyDF-M0gmMFMWJ2zO0tfKNs8Y0zbRUJaACA';
        const weatherAPIKey = '6e76605e3f2672147d041fcb0df33e81';
        const geocodingAPI = $http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${geocodingAPIKey}`);
        const weatherAPI = $http.jsonp(`https://api.darksky.net/forecast/${weatherAPIKey}/${lat},${lng}?callback=JSON_CALLBACK`);
        console.log(geocodingAPI, weatherAPI);

        $q.all([geocodingAPI, weatherAPI]).then(data => {
            $scope.location = data[0].data.results[0].address_components[3].long_name;
            $scope.tempType = JSON.parse(localStorage.getItem('tempType')) || 'f';
            $scope.currentWeatherIcon =  `wi wi-forecast-io-${data[1].data.currently.icon}`;
            $scope.currentWeather = data[1].data.currently.summary;
            $scope.sunrise = data[1].data.daily.data[0].sunriseTime;
            $scope.sunset = data[1].data.daily.data[0].sunsetTime;
            $scope.hourly = data[1].data.hourly.data;
            $scope.daily = data[1].data.daily.data;
            $scope.loadingSpinner = false;
            $scope.success = true;

            function displayF() {
                $scope.currentTemp = data[1].data.currently.temperature;
                $scope.hourlyFahrenheit = true;
                $scope.hourlyCelsius = false;
                $scope.dailyFahrenheit = true;
                $scope.dailyCelsius = false;
            }

            function displayC() {
                $scope.currentTemp = (data[1].data.currently.temperature-32) * (5/9);
                $scope.hourlyFahrenheit = false;
                $scope.hourlyCelsius = true;
                $scope.dailyFahrenheit = false;
                $scope.dailyCelsius = true;
            }

            if ($scope.tempType === 'f') {
                displayF();
            }
            else {
            displayC();
            }

            $scope.changeTempType = () => {
                if ($scope.tempType === 'f') {
                $scope.tempType = 'c';
                displayC();
                }
                else {
                $scope.tempType = 'f';
                displayF();
                }
                localStorage.setItem('tempType', JSON.stringify($scope.tempType));
            }

        }).catch(() => {
            $scope.loadingSpinner = false;
            $scope.errorMessage = 'Unable to load current weather.';
            $scope.errorHandling = true;
        });
    }

    function getError(err) {
        $scope.$apply(() => {
          $scope.loadingSpinner = false;
          $scope.errorMessage = `${err.message}.`;
          $scope.errorHandling = true;
        });
      }

      navigator.geolocation.getCurrentPosition(getSuccess, getError);
});