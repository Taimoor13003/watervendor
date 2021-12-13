import { Suspense, lazy, Fragment } from 'react';
import { Redirect, Route } from 'react-router-dom';

import SidebarLayout from 'src/layouts/SidebarLayout';
import BaseLayout from 'src/layouts/BaseLayout';

import SuspenseLoader from 'src/components/SuspenseLoader';


export const renderRoutes = (routes = []) => (
  <Suspense fallback={<SuspenseLoader />}>
    <Route>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Component = route.component;

        console.log(route, 'route')
        console.log(route.component, 'route')
        return (
          <Route
            key={i}
            path={route.path}
            render={props => (
              <Guard>
                <Layout>
                  {route.routes ? (
                    renderRoutes(route.routes)
                  ) : (
                    <Component {...props} />
                  )}
                </Layout>
              </Guard>
            )}
          />
        );
      })}
    </Route>
  </Suspense>
);






export default interface IRoute {
  path?: string,
  name?: string,
  exact?: boolean,
  protected?: boolean,
  component?: any,
  layout? : any,
  routes?: IRoute[],
  props?

}



export const routes: IRoute[] = [


  // {
  //   exact: true,
  //   path: '/404',
  //   component: lazy(() => import('src/views/errors/NotFoundView'))
  // },
  // {
  //   exact: true,
  //   guard: GuestGuard,
  //   path: '/login',
  //   component: lazy(() => import('src/views/auth/LoginView'))
  // },
  // {
  //   exact: true,
  //   path: '/login-unprotected',
  //   component: lazy(() => import('src/views/auth/LoginView'))
  // },
  // {
  //   exact: true,
  //   guard: GuestGuard,
  //   path: '/register',
  //   component: lazy(() => import('src/views/auth/RegisterView'))
  // },
  // {
  //   exact: true,
  //   guard: GuestGuard,
  //   path: '/forgot-Password',
  //   component: lazy(() => import('src/views/auth/ForgotPassword'))
  // },
  // {
  //   exact: true,
  //   guard: RestGuard,
  //   path: '/reset-Password/:resetId',
  //   component: lazy(() => import('src/views/auth/ResetPassword'))
  // },
  // {
  //   exact: true,
  //   guard: RestGuard,
  //   path: '/verify-user/:userId',
  //   component: lazy(() => import('src/views/auth/EmailVerify'))
  // },
  // {
  //   exact: true,
  //   path: '/register-unprotected',
  //   component: lazy(() => import('src/views/auth/RegisterView'))
  // },
  {
    path: '/components',
    layout: SidebarLayout,
    routes: [
      {
        exact: true,
        path: '/components/buttons',
        component: lazy(() => import('src/content/pages/Components/Buttons'))
      },
      {
        exact: true,
        path: '/components/modals',
        component: lazy(() => import('src/content/pages/Components/Modals'))
      },
      {
        exact: true,
        path: '/components/accordians',
        component: lazy(() => import('src/content/pages/Components/Accordions'))
      },
      {
        exact: true,
        path: '/components/tabs',
        component: lazy(() => import('src/content/pages/Components/Tabs'))
      },
      {
        exact: true,
        path: '/components/badges',
        component: lazy(() => import('src/content/pages/Components/Badges'))
      },
      {
        exact: true,
        path: '/components/tooltips',
        component: lazy(() => import('src/content/pages/Components/Tooltips'))
      },
      {
        exact: true,
        path: '/components/avatars',
        component: lazy(() => import('src/content/pages/Components/Avatars'))
      },
      {
        exact: true,
        path: '/components/cards',
        component: lazy(() => import('src/content/pages/Components/Cards'))
      },

      {
        exact: true,
        path: '/components/forms',
        component: lazy(() => import('src/content/pages/Components/Forms'))
      },
      
      {
        component: () => <Redirect to="/components/buttons" />
      }
    ]
  },
  {
    path: '/management',
    layout: SidebarLayout,
    routes: [
      {
        exact: true,
        path: '/management/transactions',
        component: lazy(() => import('src/content/applications/Transactions'))
      },
      {
        exact: true,
        path: '/management/profile/details',
        component: lazy(() => import('src/content/applications/Users/profile'))
      },
      {
        exact: true,
        path: '/management/profile/settings',
        component: lazy(() => import('src/content/applications/Users/settings'))
      },
      
      {
        component: () => <Redirect to="/management/transactions" />
      }
    ]
  },

  {
    path: '/dashboards',
    layout: SidebarLayout,
    routes: [
      {
        exact: true,
        path: '/dashboards/crypto',
        component: lazy(() => import('src/content/dashboards/Crypto'))
      },
      {
        exact: true,
        path: '/dashboards/messenger',
        component: lazy(() => import('src/content/applications/Messenger'))
      }
    ]
  },


  {
    path: '*',
    layout: BaseLayout,
    routes: [

      {
        exact: true,
        path: '/',
        component: lazy(() => import('src/content/overview'))
      },

      // Status

      {
        exact: true,
        path: '/404',
        component: lazy(() => import('src/content/pages/Status/Status404'))
      },
      {
        exact: true,
        path: '/500',
        component: lazy(() => import('src/content/pages/Status/Status500'))
      },
      {
        exact: true,
        path: '/maintenance',
        component: lazy(() => import('src/content/pages/Status/Maintenance'))
      },
      {
        exact: true,
        path: '/coming-soon',
        component: lazy(() => import('src/content/pages/Status/ComingSoon'))
      },
      {
        component: () => <Redirect to="/404" />
      }


    ]
  }

];













