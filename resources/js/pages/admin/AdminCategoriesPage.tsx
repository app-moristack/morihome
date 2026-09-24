import { categoryLabel } from '@/i18n/labels'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Save } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError } from '@/api/client'
import { adminApi } from '@/api/endpoints'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/hooks/useToast'
import type { ServiceCategory } from '@/types/api'

type DraftCategory = {
  id?: number
  name: string
  slug: string
  icon: string
  sort_order: number
  is_active: boolean
  is_popular: boolean
}

const EMPTY_DRAFT: DraftCategory = {
  name: '',
  slug: '',
  icon: 'wrench',
  sort_order: 500,
  is_active: true,
  is_popular: false,
}

function toDraft(category: ServiceCategory): DraftCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon ?? 'wrench',
    sort_order: category.sort_order,
    is_active: category.is_active ?? true,
    is_popular: category.is_popular,
  }
}

export default function AdminCategoriesPage() {
  useLocale()
  const [params, setParams] = useSearchParams()
  const [draftOverride, setDraft] = useState<DraftCategory | null>(null)
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminApi.categories,
  })

  const requestedCategory = categories.find((category) => category.id === Number(params.get('edit')))
  const draft =
    draftOverride ??
    (params.get('new') === '1' ? EMPTY_DRAFT : requestedCategory ? toDraft(requestedCategory) : null)
  const closeEditor = () => {
    setDraft(null)
    const next = new URLSearchParams(params)
    next.delete('new')
    next.delete('edit')
    setParams(next, { replace: true })
  }
  const term = params.get('term') ?? ''
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(term.toLowerCase()),
  )

  const save = useMutation({
    mutationFn: ({ id, ...attributes }: DraftCategory) => adminApi.saveCategory(attributes, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] })
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
      showToast('Category saved.', 'success')
      closeEditor()
    },
    onError: (error) =>
      showToast(
        error instanceof ApiError
          ? (Object.values(error.errors)[0]?.[0] ?? error.message)
          : t('Save failed.'),
        'error',
      ),
  })

  return (
    <div className="admin-categories-page">
      <PageHeader
        eyebrow={t('Administration')}
        title={t('Service categories')}
        description={t(
          'Categories drive the search dropdown and the popular-services grid on the home page.',
        )}
        action={
          <Button onClick={() => setDraft(EMPTY_DRAFT)} leadingIcon={<Plus className="size-4" />}>
            {t('New category')}
          </Button>
        }
      />

      {draft ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            save.mutate({
              ...draft,
              slug:
                draft.slug ||
                draft.name
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, ''),
            })
          }}
          className="card mt-6 grid gap-4 p-5 sm:grid-cols-2"
        >
          <h2 className="text-lg font-bold text-ink-900 sm:col-span-2">
            {draft.id ? t('Edit {name}', { name: draft.name }) : t('New category')}
          </h2>

          <TextField
            label={t('Name')}
            isRequired
            required
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
          <TextField
            label={t('Slug')}
            value={draft.slug}
            placeholder={t('auto-generated from the name')}
            onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
          />
          <TextField
            label={t('Lucide icon name')}
            value={draft.icon}
            hint={t('e.g. wrench, zap, droplets')}
            onChange={(event) => setDraft({ ...draft, icon: event.target.value })}
          />
          <TextField
            label={t('Sort order')}
            type="number"
            value={draft.sort_order}
            onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })}
          />

          <div className="flex flex-col gap-3 sm:col-span-2">
            <label className="flex items-center gap-3 text-sm font-medium text-ink-700">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })}
                className="size-5 rounded accent-brand-500"
              />
              {t('Active — providers can choose it and customers can search it')}
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-ink-700">
              <input
                type="checkbox"
                checked={draft.is_popular}
                onChange={(event) => setDraft({ ...draft, is_popular: event.target.checked })}
                className="size-5 rounded accent-brand-500"
              />
              {t('Show in the popular-services grid on the home page')}
            </label>
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" isLoading={save.isPending} leadingIcon={<Save className="size-4" />}>
              {t('Save category')}
            </Button>
            <Button type="button" variant="ghost" onClick={closeEditor}>
              {t('Cancel')}
            </Button>
          </div>
        </form>
      ) : null}

      <form
        className="admin-category-search"
        onSubmit={(event) => {
          event.preventDefault()
          setParams({ term: String(new FormData(event.currentTarget).get('term') ?? '') })
        }}
        key={term}
      >
        <input
          aria-label={t('Search categories')}
          name="term"
          defaultValue={term}
          placeholder={t('Search service categories')}
        />
        <button type="submit">{t('Search')}</button>
      </form>
      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div role="alert">
            {t('Could not load categories.')} <button onClick={() => void refetch()}>{t('Retry')}</button>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filteredCategories.map((category) => (
              <li key={category.id} className="card flex items-center gap-3 p-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink-900">
                    {categoryLabel(category.name)}
                  </span>
                  <span className="block text-xs text-ink-500">
                    /{category.slug} {t('· icon:')} {category.icon ?? '—'} {t('· order')}{' '}
                    {category.sort_order}
                  </span>
                </span>
                {category.is_popular ? <Badge tone="brand">{t('Popular')}</Badge> : null}
                <Badge tone={category.is_active ? 'success' : 'neutral'}>
                  {category.is_active ? t('Active') : t('Inactive')}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => setDraft(toDraft(category))}>
                  {t('Edit')}
                </Button>
              </li>
            ))}
            {filteredCategories.length === 0 ? (
              <li className="admin-empty">{t('No categories match this search.')}</li>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  )
}
