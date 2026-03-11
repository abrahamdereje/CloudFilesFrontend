import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { user, loading } = useAuth()

  // Wait for auth state to be determined
  if (loading.value) {
    return
  }

  // Redirect to login if not authenticated and trying to access protected route
  if (!user.value && to.path !== '/login' && to.path !== '/register') {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // Redirect to home if authenticated and trying to access auth pages
  if (user.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/')
  }
})