import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { RequireAdmin, RequireProvider } from '@/components/layout/RouteGuards'
import { Spinner } from '@/components/ui/Spinner'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SearchPage } from '@/pages/SearchPage'

const ProviderProfilePage = lazy(() => import('@/pages/ProviderProfilePage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const StaticPage = lazy(() => import('@/pages/StaticPage'))
const InstallPage = lazy(() => import('@/pages/InstallPage'))
const ProviderDashboardPage = lazy(() => import('@/pages/provider/ProviderDashboardPage'))
const ProviderProfileEditPage = lazy(() => import('@/pages/provider/ProviderProfileEditPage'))
const ProviderPortfolioPage = lazy(() => import('@/pages/provider/ProviderPortfolioPage'))
const ProviderSecurityPage = lazy(() => import('@/pages/provider/ProviderSecurityPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminReviewQueuePage = lazy(() => import('@/pages/admin/AdminReviewQueuePage'))
const AdminProviderReviewPage = lazy(() => import('@/pages/admin/AdminProviderReviewPage'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'))

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />

        <Route
          path="providers/:slug"
          element={
            <Suspense fallback={<Spinner label="Loading profile" />}>
              <ProviderProfilePage />
            </Suspense>
          }
        />

        <Route
          path="register"
          element={
            <Suspense fallback={<Spinner label="Loading registration" />}>
              <RegisterPage />
            </Suspense>
          }
        />
        <Route
          path="login"
          element={
            <Suspense fallback={<Spinner />}>
              <LoginPage />
            </Suspense>
          }
        />

        <Route
          path="install"
          element={
            <Suspense fallback={<Spinner />}>
              <InstallPage />
            </Suspense>
          }
        />

        {['about', 'contact', 'terms', 'privacy'].map((slug) => (
          <Route
            key={slug}
            path={slug}
            element={
              <Suspense fallback={<Spinner />}>
                <StaticPage slug={slug} />
              </Suspense>
            }
          />
        ))}

        <Route path="dashboard" element={<RequireProvider />}>
          <Route
            index
            element={
              <Suspense fallback={<Spinner label="Loading your dashboard" />}>
                <ProviderDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="profile"
            element={
              <Suspense fallback={<Spinner />}>
                <ProviderProfileEditPage />
              </Suspense>
            }
          />
          <Route
            path="portfolio"
            element={
              <Suspense fallback={<Spinner />}>
                <ProviderPortfolioPage />
              </Suspense>
            }
          />
          <Route
            path="security"
            element={
              <Suspense fallback={<Spinner />}>
                <ProviderSecurityPage />
              </Suspense>
            }
          />
        </Route>

        <Route path="admin" element={<RequireAdmin />}>
          <Route
            index
            element={
              <Suspense fallback={<Spinner label="Loading admin" />}>
                <AdminDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="providers"
            element={
              <Suspense fallback={<Spinner />}>
                <AdminReviewQueuePage />
              </Suspense>
            }
          />
          <Route
            path="providers/:id"
            element={
              <Suspense fallback={<Spinner />}>
                <AdminProviderReviewPage />
              </Suspense>
            }
          />
          <Route
            path="categories"
            element={
              <Suspense fallback={<Spinner />}>
                <AdminCategoriesPage />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
