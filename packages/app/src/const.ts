const forceHideGame =
  self.localStorage.getItem('forceHideGame') === 'true'
export const SHOW_GAME =
  !forceHideGame && window.location.hostname === 'localhost'
