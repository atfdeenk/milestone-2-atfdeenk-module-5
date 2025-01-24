import { NextRouter } from 'next/router';

export const clearSearch = (router: NextRouter, setSearchValue: (value: string) => void) => {
  setSearchValue('');
  const query = { ...router.query };
  delete query.search;
  router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
};
