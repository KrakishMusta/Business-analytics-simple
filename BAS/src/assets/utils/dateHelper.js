export const getDefaultStartDate = () => {
  const date = new Date(Date.now());
  return date.toISOString().split('T')[0];
};

export const getDefaultEndDate = () => {
  return new Date().toISOString().split('T')[0];
};

export const setDefaultDatesForRoute = (routeName) => {
  const defaults = {
    'sales': {
      start: '1999-12-31',
      end: getDefaultEndDate()
    },
    'orders': {
      start: '1999-12-31',
      end: getDefaultEndDate()
    },
    'stocks': {
      start: getDefaultStartDate(),
      end: ''
    }
    ,
    'incomes': {
      start: '1999-12-31',
      end: getDefaultEndDate()
    }
  };
  
  return defaults[routeName] || { start: '', end: '' };
};