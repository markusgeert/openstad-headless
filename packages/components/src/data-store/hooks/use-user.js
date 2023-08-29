import SessionStorage from '../../lib/session-storage.js';
import useSWR from 'swr';
import { useState } from 'react';

export default function useUser(props) {

  let self = this;

  const projectId = props.projectId || props.config?.projectId;

  const { data, error, isLoading } = useSWR({ type: 'current-user', projectId: self.projectId }, getCurrentUser);

  async function getCurrentUser() {

    console.log('GETCURRENTUSER', self.currentUser);
    if (self.currentUser && self.currentUser.id) { // just once TODO: ik denk dat het jkan met useSWRmutaion,: als ik het goedlees update die alleen met de hand
      return self.currentUser;
    }
    
    const session = new SessionStorage(props);

    // get user from props
    let initialUser = props.openStadUser || props.config?.openStadUser || {};
    if (initialUser.id && initialUser.projectId == self.projectId) {
      console.log(3, initialUser);
      return initialUser;
    }
    
    const cmsUser = props.cmsUser || props.config.cmsUser || {};

    // get cmsUser from session data - this is a fix for badly written cms logouts
    let sessionCmsUser = session.get('cmsUser') || {};
    if (sessionCmsUser && cmsUser) {
      // compare with current cmsUser
      if (sessionCmsUser.access_token != cmsUser.access_token) {
        // delete exising session cache
        session.remove('cmsUser');
        session.remove('openStadUser');
      }
    }
    session.set('cmsUser', cmsUser);

    // get openStad user from session data
    let sessionUser = session.get('openStadUser') || {};
    
    // use existing jwt
    let jwt = initialUser.jwt || sessionUser.jwt;

    // or get jwt for cmsUser
    if (!jwt && cmsUser && cmsUser.access_token && cmsUser.iss) {
      jwt = await self.api.user.connectUser({ projectId: self.projectId, cmsUser })
    }

    // fetch me for this jwt
    if (jwt) {

      self.api.currentUserJWT = jwt; // use current user in subsequent requests

      // refresh already fetched data, now with the current user
      self.refresh()

      // TODO: delete jwt on error
      let openStadUser = self.api.user.fetchMe({ projectId: self.projectId })
      session.set('openStadUser', openStadUser);
      return openStadUser;

    } else {
      return {};
    }

  }

  return [ data, () => console.log('setUser not (yet) implemented'), error, isLoading ];

}

