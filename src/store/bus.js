import req from './api';

export const toSearchBus = (selectedCity, params) => {
  return req('get', 'Bus/Route/City/' + selectedCity, params);
};

export const stopRoute = (selectedCity, selectedBus, params) => {
  return req(
    'get',
    'Bus/StopOfRoute/City/' + selectedCity + '/' + selectedBus,
    params
  );
};

export const routeGeo = (selectedCity, selectedBus, params) => {
  return req(
    'get',
    'Bus/Shape/City/' + selectedCity + '/' + selectedBus,
    params
  );
};
