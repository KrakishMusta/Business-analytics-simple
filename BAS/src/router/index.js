import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { 
      path: '/welcome', 
      component: () => import('../pages/Welcome.vue'),
      meta: { 
        title: 'Стратовая страница'
      }
  },
    { 
      path: '/sales', 
      component: () => import('../pages/Sales.vue'),
      meta: { 
        title: 'Продажи'
      }
  },
    { 
      path: '/orders', 
      component: () => import('../pages/Sales.vue'),
      meta: { 
        title: 'Заказы'
      }
  },
    { 
      path: '/stocks', 
      component: () => import('../pages/Sales.vue'),
      meta: { 
        title: 'Склады'
      }
  },
    { 
      path: '/incomes', 
      component: () => import('../pages/Sales.vue'),
      meta: { 
        title: 'Доходы'
      }
  },


]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
    document.title = to.meta.title;
    next();
});

export default router
