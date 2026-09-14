import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { RequireAdmin, RequireProvider } from '@/components/layout/RouteGuards'
import { Spinner } from '@/components/ui/Spinner'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SearchPage } from '@/pages/SearchPage'

const ProviderProfilePage = lazy(() => import('@/pages/ProviderProfilePage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ForProfessionalsPage = lazy(() => import('@/pages/ForProfessionalsPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const StaticPage = lazy(() => import('@/pages/StaticPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const InstallPage = lazy(() => import('@/pages/InstallPage'))
const PropertySearchPage = lazy(() => import('@/pages/PropertySearchPage'))
const ProviderDashboardPage = lazy(() => import('@/pages/provider/ProviderDashboardPage'))
const ProviderProfileEditPage = lazy(() => import('@/pages/provider/ProviderProfileEditPage'))
const ProviderPortfolioPage = lazy(() => import('@/pages/provider/ProviderPortfolioPage'))
const ProviderSecurityPage = lazy(() => import('@/pages/provider/ProviderSecurityPage'))
const ProviderPropertiesPage = lazy(() => import('@/pages/provider/ProviderPropertiesPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminReviewQueuePage = lazy(() => import('@/pages/admin/AdminReviewQueuePage'))
const AdminProviderReviewPage = lazy(() => import('@/pages/admin/AdminProviderReviewPage'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'))
const AdminSubscriptionsPage = lazy(() => import('@/pages/admin/AdminSubscriptionsPage'))

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route
          path="properties"
          element={
            <Suspense fallback={<Spinner label="Loading properties" />}>
              <PropertySearchPage />
            </Suspense>
          }
        />

        <Route
          path="providers/:slug"
          element={
            <Suspense fallback={<Spinner label="Loading profile" />}>
              <ProviderProfilePage />
            </Suspense>
          }
        />

        <Route
          path="for-professionals"
          element={
            <Suspense fallback={<Spinner label="Loading professional plans" />}>
              <ForProfessionalsPage />
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
        <Route path="register/individual" element={<Navigate to="/register?type=individual" replace />} />
        <Route path="register/business" element={<Navigate to="/register?type=agency" replace />} />
        <Route
          path="login"
          element={
            <Suspense fallback={<Spinner />}>
              <LoginPage />
            </Suspense>
          }
        />

        <Route
          path="reset-password"
          element={
            <Suspense fallback={<Spinner />}>
              <ResetPasswordPage />
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

        <Route
          path="about"
          element={
            <Suspense fallback={<Spinner />}>
              <AboutPage />
            </Suspense>
          }
        />

        <Route
          path="contact"
          element={
            <Suspense fallback={<Spinner />}>
              <ContactPage />
            </Suspense>
          }
        />

        {['terms', 'privacy'].map((slug) => (
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
          <Route
            path="properties"
            element={
              <Suspense fallback={<Spinner label="Loading properties" />}>
                <ProviderPropertiesPage />
              </Suspense>
            }
          />
        </Route>

        <Route path="admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route
              path="users"
              element={
                <Suspense fallback={<Spinner label="Loading users" />}>
                  <AdminUsersPage />
                </Suspense>
              }
            />
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
            <Route
              path="subscriptions"
              element={
                <Suspense fallback={<Spinner label="Loading subscriptions" />}>
                  <AdminSubscriptionsPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
