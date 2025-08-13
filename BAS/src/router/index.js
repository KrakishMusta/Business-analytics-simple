import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { 
      path: '/',
      name: 'welcome',
      component: () => import('../pages/Welcome.vue'),
      meta: { 
        title: 'Стратовая страница'
      }
  },
    { 
      path: '/sales',
      name: 'sales',
      component: () => import('../pages/Sales.vue'),
      meta: { 
        title: 'Продажи'
      }
  },
    { 
      path: '/orders',
      name: 'orders',
      component: () => import('../pages/Orders.vue'),
      meta: { 
        title: 'Заказы'
      }
  },
    { 
      path: '/stocks',
      name: 'stocks',
      component: () => import('../pages/Stocks.vue'),
      meta: { 
        title: 'Склады'
      }
  },
    { 
      path: '/incomes',
      name: 'incomes',
      component: () => import('../pages/Incomes.vue'),
      meta: { 
        title: 'Доходы'
      }
  },
]

const router = createRouter({
  // history: createWebHistory('/Business-analytics-simple/'),
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
    document.title = to.meta.title;
    next();
});

export default router
