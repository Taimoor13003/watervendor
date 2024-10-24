
import { VerticalNavItemsType } from 'src/@core/layouts/types'

type Environment = "development" | "production";

const env: Environment = "development"; // Change to "production" as needed

const devNavItems: VerticalNavItemsType = [
  {
    sectionTitle: 'Application Menu'
  },
  {
    title: 'Customers',
    icon: 'tabler:users',
    path: '/app/customers',
  },
  {
    title: 'Orders',
    icon: 'tabler:receipt',
    path: '/app/orders'
  },
  {
    title: 'Vouchers',
    icon: 'tabler:discount',
    path: '/app/vouchers' 
  },
  {
    title: 'Products',
    icon: 'tabler:package',
    path: '/app/products'
  },
  {
    title: 'Accounts',
    icon: 'tabler:file-text',
    path: '/app/accounts'
  },
  
  {
    title: 'Reports',
    icon: 'tabler:smart-home',
    badgeContent: 'new',
    badgeColor: 'error',
    children: [
      {
        title: 'Reports by Rate',
        path: '/app/reportFolder'
      },
      {
        title: 'Customer Invoice',
        path: '/app/customerinvoice'
      },
      {
        title: 'Account Reports',
        path: '/app/accountsreports'
      }
    ]
  },
  {
    sectionTitle: 'Apps & Pages'
  },
  {
    title: 'Email',
    icon: 'tabler:mail',
    path: '/apps/email'
  },
  {
    title: 'Chat',
    icon: 'tabler:messages',
    path: '/apps/chat'
  },
  {
    title: 'Calendar',
    icon: 'tabler:calendar',
    path: '/apps/calendar'
  },
  {
    title: 'Invoice',
    icon: 'tabler:file-dollar',
    children: [
      {
        title: 'List',
        path: '/apps/invoice/list'
      },
      {
        title: 'Preview',
        path: '/apps/invoice/preview'
      },
      {
        title: 'Edit',
        path: '/apps/invoice/edit'
      },
      {
        title: 'Add',
        path: '/apps/invoice/add'
      }
    ]
  },
  {
    title: 'User',
    icon: 'tabler:user',
    children: [
      {
        title: 'List',
        path: '/apps/user/list'
      },
      {
        title: 'View',
        children: [
          {
            title: 'Account',
            path: '/apps/user/view/account'
          },
          {
            title: 'Security',
            path: '/apps/user/view/security'
          },
          {
            title: 'Billing & Plans',
            path: '/apps/user/view/billing-plan'
          },
          {
            title: 'Notifications',
            path: '/apps/user/view/notification'
          },
          {
            title: 'Connection',
            path: '/apps/user/view/connection'
          }
        ]
      }
    ]
  },
  {
    title: 'Roles & Permissions',
    icon: 'tabler:settings',
    children: [
      {
        title: 'Roles',
        path: '/apps/roles'
      },
      {
        title: 'Permissions',
        path: '/apps/permissions'
      }
    ]
  },
  {
    title: 'Pages',
    icon: 'tabler:file',
    children: [
      {
        title: 'User Profile',
        children: [
          {
            title: 'Profile',
            path: '/pages/user-profile/profile'
          },
          {
            title: 'Teams',
            path: '/pages/user-profile/teams'
          },
          {
            title: 'Projects',
            path: '/pages/user-profile/projects'
          },
          {
            title: 'Connections',
            path: '/pages/user-profile/connections'
          }
        ]
      },
      {
        title: 'Account Settings',
        children: [
          {
            title: 'Account',
            path: '/pages/account-settings/account'
          },
          {
            title: 'Security',
            path: '/pages/account-settings/security'
          },
          {
            title: 'Billing',
            path: '/pages/account-settings/billing'
          },
          {
            title: 'Notifications',
            path: '/pages/account-settings/notifications'
          },
          {
            title: 'Connections',
            path: '/pages/account-settings/connections'
          }
        ]
      },
      {
        title: 'FAQ',
        path: '/pages/faq'
      },
      {
        title: 'Help Center',
        path: '/pages/help-center'
      },
      {
        title: 'Pricing',
        path: '/pages/pricing'
      },
      {
        title: 'Miscellaneous',
        children: [
          {
            openInNewTab: true,
            title: 'Coming Soon',
            path: '/pages/misc/coming-soon'
          },
          {
            openInNewTab: true,
            title: 'Under Maintenance',
            path: '/pages/misc/under-maintenance'
          },
          {
            openInNewTab: true,
            title: 'Page Not Found - 404',
            path: '/pages/misc/404-not-found'
          },
          {
            openInNewTab: true,
            title: 'Not Authorized - 401',
            path: '/pages/misc/401-not-authorized'
          },
          {
            openInNewTab: true,
            title: 'Server Error - 500',
            path: '/pages/misc/500-server-error'
          }
        ]
      }
    ]
  },
  {
    title: 'Auth Pages',
    icon: 'tabler:lock',
    children: [
      {
        title: 'Login',
        children: [
          {
            openInNewTab: true,
            title: 'Login v1',
            path: '/pages/auth/login-v1'
          },
          {
            openInNewTab: true,
            title: 'Login v2',
            path: '/pages/auth/login-v2'
          },
          {
            openInNewTab: true,
            title: 'Login With AppBar',
            path: '/pages/auth/login-with-appbar'
          }
        ]
      },
      {
        title: 'Register',
        children: [
          {
            openInNewTab: true,
            title: 'Register v1',
            path: '/pages/auth/register-v1'
          },
          {
            openInNewTab: true,
            title: 'Register v2',
            path: '/pages/auth/register-v2'
          },
          {
            openInNewTab: true,
            title: 'Register Multi-Steps',
            path: '/pages/auth/register-multi-steps'
          }
        ]
      },
      {
        title: 'Verify Email',
        children: [
          {
            openInNewTab: true,
            title: 'Verify Email v1',
            path: '/pages/auth/verify-email-v1'
          },
          {
            openInNewTab: true,
            title: 'Verify Email v2',
            path: '/pages/auth/verify-email-v2'
          }
        ]
      },
      {
        title: 'Forgot Password',
        children: [
          {
            openInNewTab: true,
            title: 'Forgot Password v1',
            path: '/pages/auth/forgot-password-v1'
          },
          {
            openInNewTab: true,
            title: 'Forgot Password v2',
            path: '/pages/auth/forgot-password-v2'
          }
        ]
      },
      {
        title: 'Reset Password',
        children: [
          {
            openInNewTab: true,
            title: 'Reset Password v1',
            path: '/pages/auth/reset-password-v1'
          },
          {
            openInNewTab: true,
            title: 'Reset Password v2',
            path: '/pages/auth/reset-password-v2'
          }
        ]
      },
      {
        title: 'Two Steps',
        children: [
          {
            openInNewTab: true,
            title: 'Two Steps v1',
            path: '/pages/auth/two-steps-v1'
          },
          {
            openInNewTab: true,
            title: 'Two Steps v2',
            path: '/pages/auth/two-steps-v2'
          }
        ]
      }
    ]
  },
  {
    title: 'Wizard Examples',
    icon: 'tabler:forms',
    children: [
      {
        title: 'Checkout',
        path: '/pages/wizard-examples/checkout'
      },
      {
        title: 'Property Listing',
        path: '/pages/wizard-examples/property-listing'
      },
      {
        title: 'Create Deal',
        path: '/pages/wizard-examples/create-deal'
      }
    ]
  },
  {
    icon: 'tabler:square',
    title: 'Dialog Examples',
    path: '/pages/dialog-examples'
  },
  {
    sectionTitle: 'User Interface'
  },
  {
    title: 'Typography',
    icon: 'tabler:typography',
    path: '/ui/typography'
  },
  {
    title: 'Icons',
    icon: 'tabler:icon',
    path: '/ui/icons'
  },
  {
    title: 'Colors',
    icon: 'tabler:color-picker',
    path: '/ui/colors'
  },
  {
    title: 'Cards',
    icon: 'tabler:card',
    path: '/ui/cards'
  },
  {
    title: 'Buttons',
    icon: 'tabler:button',
    path: '/ui/buttons'
  },
  {
    title: 'Form Elements',
    icon: 'tabler:forms',
    path: '/ui/form-elements'
  },
  {
    title: 'Tables',
    icon: 'tabler:table',
    path: '/ui/tables'
  },
  {
    title: 'Charts',
    icon: 'tabler:chart',
    path: '/ui/charts'
  },
  {
    title: 'Maps',
    icon: 'tabler:map',
    path: '/ui/maps'
  },
  {
    sectionTitle: 'Extra'
  },
  {
    title: 'Timeline',
    icon: 'tabler:timeline',
    path: '/extra/timeline'
  },
  {
    title: 'Kanban',
    icon: 'tabler:kanban',
    path: '/extra/kanban'
  },
  {
    title: 'Tree',
    icon: 'tabler:tree',
    path: '/extra/tree'
  },
  {
    title: 'Clipboard',
    icon: 'tabler:clipboard',
    path: '/extra/clipboard'
  },
  {
    title: 'Menu Levels',
    icon: 'tabler:menu',
    children: [
      {
        title: 'Menu Level 1',
        path: '/extra/menu-level-1'
      },
      {
        title: 'Menu Level 2',
        children: [
          {
            title: 'Menu Level 2.1',
            path: '/extra/menu-level-2-1'
          },
          {
            title: 'Menu Level 2.2',
            path: '/extra/menu-level-2-2'
          }
        ]
      }
    ]
  }
];

const prodNavItems :  VerticalNavItemsType = [
  {
    sectionTitle: 'Application Menu'
  },
  {
    title: 'Customers',
    icon: 'tabler:users',
    path: '/app/customers',
  },
  {
    title: 'Orders',
    icon: 'tabler:receipt',
    path: '/app/orders'
  },
  {
    title: 'Vouchers',
    icon: 'tabler:discount',
    path: '/app/vouchers' 
  },
  {
    title: 'Products',
    icon: 'tabler:package',
    path: '/app/products'
  },
  {
    title: 'Accounts',
    icon: 'tabler:file-text',
    path: '/app/accounts'
  },
  {
    title: 'Reports',
    icon: 'tabler:smart-home',
    badgeContent: 'new',
    badgeColor: 'error',
    children: [
      {
        title: 'Reports by Rate',
        path: '/app/reportFolder'
      },
      {
        title: 'Customer Invoice',
        path: '/app/customerinvoice'
      },
      {
        title: 'Account Reports',
        path: '/app/accountsreports'
      }
    ]
  },
]


const navigation = (): VerticalNavItemsType => {

  switch (env as Environment) {
    case "production":
      return prodNavItems;
    case "development":
      return devNavItems;
    default:
      // Handle unexpected environment values
      throw new Error(`Unexpected environment value: ${env}`);
  }
};

export default navigation;