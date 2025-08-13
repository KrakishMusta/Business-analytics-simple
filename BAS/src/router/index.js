import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { 
      path: '/Business-analytics-simple/',
      name: 'welcome',
      component: () => import('../pages/Welcome.vue'),
      meta: { 
        title: 'Стратовая страница'
      }
  },
    { 
      path: '/Business-analytics-simple/sales',
      name: 'sales',
      component: () => import('../pages/Sales.vue'),
      meta: { 
        title: 'Продажи'
      }
  },
    { 
      path: '/Business-analytics-simple/orders',
      name: 'orders',
      component: () => import('../pages/Orders.vue'),
      meta: { 
        title: 'Заказы'
      }
  },
    { 
      path: '/Business-analytics-simple/stocks',
      name: 'stocks',
      component: () => import('../pages/Stocks.vue'),
      meta: { 
        title: 'Склады'
      }
  },
    { 
      path: '/Business-analytics-simple/incomes',
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
